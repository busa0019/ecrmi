import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Question from "@/models/Question";
import Course from "@/models/Course";
import Certificate from "@/models/Certificate";
import Participant from "@/models/Participant";
import { gradeTest } from "@/lib/grading";
import { sendCertificateEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      participantName,
      participantEmail,
      courseId,
      answers,
    } = await req.json();

    const email = participantEmail.toLowerCase().trim();

    // ✅ LIMIT ATTEMPTS (MAX 3)
    const attemptCount = await Attempt.countDocuments({
      participantEmail: email,
      courseId,
    });

    if (attemptCount >= 3) {
      return Response.json(
        { error: "Maximum attempts reached" },
        { status: 403 }
      );
    }

    const questions = await Question.find({ courseId });
    const course = await Course.findById(courseId);

    if (!course || questions.length === 0) {
      return Response.json(
        { error: "Invalid course or questions missing" },
        { status: 400 }
      );
    }

    // ✅ GRADE TEST
    const score = gradeTest(answers, questions);
    const passed = score >= course.passMark;

    // ✅ SAVE ATTEMPT
    const attempt = await Attempt.create({
      participantName,
      participantEmail: email,
      courseId,
      answers,
      score,
      passed,
    });

    let certificateId: string | null = null;

    // ✅ CREATE CERTIFICATE ONLY ON PASS
    if (passed) {
      certificateId = crypto.randomUUID();

      await Certificate.create({
        certificateId,
        participantName,
        participantEmail: email,
        courseId,
        courseTitle: course.title,
        score,
        attemptId: attempt._id,
        issuedAt: new Date(),
      });

      // ✅ LOCK NAME AFTER FIRST PASS
      await Participant.findOneAndUpdate(
        { email },
        { nameLocked: true }
      );

      // ✅ SEND CERTIFICATE EMAIL
      await sendCertificateEmail({
        to: email,
        name: participantName,
        certificateUrl: `https://training.ecrmil.org/verify/${certificateId}`,
      });
    }

    return Response.json({
      score,
      passed,
      certificateId,
    });
  } catch (err) {
    console.error("❌ CBT error:", err);
    return Response.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}