import { connectDB } from "@/lib/db";
import Participant from "@/models/Participant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email } = await req.json();

  await connectDB();

  const existing = await Participant.findOne({ email });

  if (existing?.nameLocked) {
    return NextResponse.json(
      { error: "Name is locked" },
      { status: 403 }
    );
  }

  await Participant.findOneAndUpdate(
    { email },
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
  const participant = await Participant.findOne({ email }).lean();

  return NextResponse.json(participant);
}