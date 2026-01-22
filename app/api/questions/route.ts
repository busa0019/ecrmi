import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return Response.json(
      { error: "courseId required" },
      { status: 400 }
    );
  }

  // ✅ Prevent CastError
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return Response.json(
      { error: "Invalid courseId" },
      { status: 400 }
    );
  }

  const questions = await Question.find({
    courseId: new mongoose.Types.ObjectId(courseId),
  }).lean();

  return Response.json(questions);
}