import { connectDB } from "@/lib/db";
import TrainingAccessCode from "@/models/TrainingAccessCode";
import { NextResponse } from "next/server";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function normalizeCode(code: string) {
  return String(code || "").trim().toUpperCase();
}

export async function POST(req: Request) {
  const { participantEmail, courseId, accessCode } = await req.json();

  const cleanEmail = normalizeEmail(participantEmail);
  const cleanCode = normalizeCode(accessCode);
  const cleanCourseId = String(courseId || "").trim();

  if (!cleanEmail || !cleanCourseId || !cleanCode) {
    return NextResponse.json(
      { error: "participantEmail, courseId and accessCode are required" },
      { status: 400 }
    );
  }

  await connectDB();

  // 1) atomic consume if unused (must match courseId)
  const consumed = await TrainingAccessCode.findOneAndUpdate(
    { code: cleanCode, courseId: cleanCourseId, status: "unused" },
    {
      $set: {
        status: "used",
        usedByEmail: cleanEmail,
        usedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!consumed) {
    // 2) if not consumable as unused, check if already used by SAME email for SAME course
    const existingCode = await TrainingAccessCode.findOne({
      code: cleanCode,
      courseId: cleanCourseId,
    }).lean();

    if (!existingCode) {
      // either wrong code OR code belongs to another course
      return NextResponse.json(
        { error: "Invalid access code for this course" },
        { status: 403 }
      );
    }

    if (
      existingCode.status === "used" &&
      String(existingCode.usedByEmail || "").toLowerCase() === cleanEmail
    ) {
      // ok: same person re-entering (allow)
      return NextResponse.json({ success: true, reused: true });
    }

    return NextResponse.json(
      { error: "This access code has already been used" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}