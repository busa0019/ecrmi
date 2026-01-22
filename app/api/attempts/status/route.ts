import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { participantEmail, courseIds } = await req.json();

    await connectDB();

    const attempts = await Attempt.find({
      participantEmail,
      courseId: { $in: courseIds },
    }).lean();

    // Group by courseId
    const status: Record<string, {
      attempts: number;
      passed: boolean;
    }> = {};

    for (const attempt of attempts) {
      const id = attempt.courseId.toString();

      if (!status[id]) {
        status[id] = { attempts: 0, passed: false };
      }

      status[id].attempts += 1;

      if (attempt.passed) {
        status[id].passed = true;
      }
    }

    return NextResponse.json(status);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load attempt status" },
      { status: 500 }
    );
  }
}