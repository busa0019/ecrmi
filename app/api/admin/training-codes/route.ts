export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import TrainingAccessCode from "@/models/TrainingAccessCode";

function makeCode() {
  // ECRMI-TRN- + 6 chars
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ECRMI-TRN-${s}`;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const codes = await TrainingAccessCode.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const courseId = String(body?.courseId || "").trim();

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  await connectDB();

  // generate unique code
  for (let i = 0; i < 20; i++) {
    const code = makeCode();
    const exists = await TrainingAccessCode.exists({ code });
    if (!exists) {
      const doc = await TrainingAccessCode.create({
        code,
        courseId, // ✅ NEW: bind code to course
        status: "unused",
        createdBy: String((admin as any)?._id || (admin as any)?.email || ""),
      });

      return NextResponse.json({ success: true, code: doc.code });
    }
  }

  return NextResponse.json(
    { error: "Could not generate code, please retry" },
    { status: 500 }
  );
}