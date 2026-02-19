import { connectDB } from "@/lib/db";
import Participant from "@/models/Participant";
import { NextResponse } from "next/server";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  const { name, email } = await req.json();

  const cleanEmail = normalizeEmail(email);

  if (!name || !cleanEmail) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  await connectDB();

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
  const participant = await Participant.findOne({
    email: normalizeEmail(email),
  }).lean();

  return NextResponse.json(participant);
}