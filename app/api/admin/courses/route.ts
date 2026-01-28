import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Question from "@/models/Question";
import Attempt from "@/models/Attempt";
import Certificate from "@/models/Certificate";

export const runtime = "nodejs"; // ✅ REQUIRED for mongoose

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    throw new Error("Unauthorized");
  }
}

/* ================= CREATE COURSE ================= */

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const {
      title,
      description,
      durationMinutes,
      passMark,
    } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      description,
      durationMinutes,
      passMark,
      active: true, // ✅ IMPORTANT (public page filters by active:true)
    });

    return NextResponse.json({
      success: true,
      courseId: course._id.toString(),
    });
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

/* ================= DELETE COURSE ================= */

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await req.json();

    await Course.findByIdAndDelete(id);
    await Question.deleteMany({ courseId: id });
    await Attempt.deleteMany({ courseId: id });
    await Certificate.deleteMany({ courseId: id });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}