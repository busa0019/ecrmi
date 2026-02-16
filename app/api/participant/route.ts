import { connectDB } from "@/lib/db";
import Participant from "@/models/Participant";
import TrainingAccessCode from "@/models/TrainingAccessCode";
import { NextResponse } from "next/server";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function normalizeCode(code: string) {
  return String(code || "").trim().toUpperCase();
}

export async function POST(req: Request) {
  const { name, email, accessCode } = await req.json();

  const cleanEmail = normalizeEmail(email);
  const cleanCode = normalizeCode(accessCode);

  if (!name || !cleanEmail || !cleanCode) {
    return NextResponse.json(
      { error: "Name, email and access code are required" },
      { status: 400 }
    );
  }

  await connectDB();

  // 1) Validate / consume access code (atomic consume if unused)
  const consumed = await TrainingAccessCode.findOneAndUpdate(
    { code: cleanCode, status: "unused" },
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
    // If not consumable as unused, check if it was already used by THIS email
    const existingCode = await TrainingAccessCode.findOne({ code: cleanCode }).lean();

    if (!existingCode) {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 403 }
      );
    }

    if (
      existingCode.status === "used" &&
      String(existingCode.usedByEmail || "").toLowerCase() === cleanEmail
    ) {
      // ok: same person re-initializing/resuming
    } else {
      return NextResponse.json(
        { error: "This access code has already been used" },
        { status: 403 }
      );
    }
  }

  // 2) Your existing participant logic (unchanged)
  const existing = await Participant.findOne({ email: cleanEmail });

  if (existing?.nameLocked) {
    return NextResponse.json({ error: "Name is locked" }, { status: 403 });
  }

  await Participant.findOneAndUpdate(
    { email: cleanEmail },
    { name },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json(null);

  await connectDB();
  const participant = await Participant.findOne({ email: normalizeEmail(email) }).lean();
  return NextResponse.json(participant);
}