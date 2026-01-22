import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";

/**
 * ✅ ADMIN AUTH HELPER
 */
async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    throw new Error("Unauthorized");
  }
}

/**
 * ✅ CREATE QUESTION
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const {
      courseId,
      question,
      options,
      correctAnswer,
    } = await req.json();

    if (
      !courseId ||
      !question ||
      !Array.isArray(options) ||
      options.length !== 4
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const created = await Question.create({
      courseId,
      question,
      options,
      correctAnswer,
    });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * ✅ UPDATE QUESTION
 */
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const {
      _id,
      question,
      options,
      correctAnswer,
    } = await req.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Missing question id" },
        { status: 400 }
      );
    }

    await Question.findByIdAndUpdate(_id, {
      question,
      options,
      correctAnswer,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * ✅ DELETE QUESTION
 */
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing question id" },
        { status: 400 }
      );
    }

    await Question.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}