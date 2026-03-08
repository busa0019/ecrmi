export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) throw new Error("Unauthorized");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const c: any = await Course.findById(id).lean();
    if (!c) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json({
      _id: c._id.toString(),
      title: c.title || "",
      description: c.description || "",
      durationMinutes: c.durationMinutes ?? 30,
      passMark: c.passMark ?? 70,
      pdfUrl: c.pdfUrl || "",
      materialUrls: Array.isArray(c.materialUrls) ? c.materialUrls : [],
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      description,
      durationMinutes,
      passMark,
      pdfUrl,
      materialUrls,
    } = body || {};

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      {
        title,
        description,
        durationMinutes,
        passMark,
        pdfUrl: pdfUrl || "",
        materialUrls: Array.isArray(materialUrls) ? materialUrls : [],
      },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}