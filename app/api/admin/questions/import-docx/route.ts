export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import Question from "@/models/Question";
import mammoth from "mammoth";
import mongoose from "mongoose";

function norm(s: string) {
  return String(s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function parseQuestionsFromText(text: string) {
  const cleaned = text
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " "); // non-breaking space

  // Split into blocks by "1.", "2.", "3." at line start
  const blocks = cleaned
    .split(/\n(?=\d+\.\s)/g)
    .map((b) => b.trim())
    .filter(Boolean);

  const parsed: {
    question: string;
    options: string[];
    correctIndex: number; // 0-3
  }[] = [];

  for (const block of blocks) {
    const qMatch = block.match(/^\d+\.\s*([\s\S]+?)(?=\n\s*A[\.\)]\s)/);
    if (!qMatch) continue; // skip anything that doesn't look like a question block

    const questionText = norm(qMatch[1]);

    const opt = (letter: "A" | "B" | "C" | "D") => {
      const m = block.match(new RegExp(`(?:^|\\n)\\s*${letter}[\\.\\)]\\s*(.+)`, "m"));
      return m ? norm(m[1]) : "";
    };

    const A = opt("A");
    const B = opt("B");
    const C = opt("C");
    const D = opt("D");

    // Answer line: "Answer: A. Protecting employees from hazards"
    const ansMatch = block.match(/(?:^|\n)\s*Answer:\s*([ABCD])/i);
    const ansLetter = ansMatch?.[1]?.toUpperCase() as "A" | "B" | "C" | "D" | undefined;

    if (!questionText || !A || !B || !C || !D || !ansLetter) {
      throw new Error(
        `Failed to parse a question block. Ensure format is: 1. ... A. ... B. ... C. ... D. ... Answer: A`
      );
    }

    const correctIndex = { A: 0, B: 1, C: 2, D: 3 }[ansLetter];

    parsed.push({
      question: questionText,
      options: [A, B, C, D],
      correctIndex,
    });
  }

  if (parsed.length === 0) {
    throw new Error("No questions detected. Ensure the DOCX follows the expected format.");
  }

  return parsed;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const courseId = String(form.get("courseId") || "").trim();
  const file = form.get("file");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "DOCX file is required" }, { status: 400 });
  }

  const name = (file as File).name?.toLowerCase() || "";
  if (!name.endsWith(".docx")) {
    return NextResponse.json({ error: "Only .docx is supported" }, { status: 400 });
  }

  await connectDB();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const extracted = await mammoth.extractRawText({ buffer });
  const text = extracted.value || "";

  const parsed = parseQuestionsFromText(text);

  // Insert all questions for this course
  const docs = parsed.map((p) => ({
    courseId,
    question: p.question,
    options: p.options,
    correctAnswer: p.correctIndex, // 0-3 (matches your schema)
  }));

  await Question.insertMany(docs, { ordered: true });

  return NextResponse.json({ success: true, inserted: docs.length });
}