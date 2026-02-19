export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import Course from "@/models/Course";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const coursesRaw = await Course.find()
    .select({ title: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const courses = coursesRaw.map((c: any) => ({
    _id: c._id.toString(),
    title: c.title,
  }));

  return NextResponse.json(courses);
}