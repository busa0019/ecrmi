import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Question from "@/models/Question";
import Attempt from "@/models/Attempt";
import Certificate from "@/models/Certificate";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    throw new Error("Unauthorized");
  }
}

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