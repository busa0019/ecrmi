import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const members = await Member.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(members);
}