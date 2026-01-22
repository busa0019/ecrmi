import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    throw new Error("Unauthorized");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { participantEmail, courseId } =
      await req.json();

    await Attempt.deleteMany({
      participantEmail,
      courseId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}