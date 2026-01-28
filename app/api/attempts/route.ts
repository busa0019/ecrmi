import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Question from "@/models/Question";
import Course from "@/models/Course";
import Certificate from "@/models/Certificate";
import Participant from "@/models/Participant";
import { gradeTest } from "@/lib/grading";
import { sendCertificateEmail } from "@/lib/email";

/* ================= CERTIFICATE CODE GENERATOR ================= */

function generateCertificateId({
  courseTitle,
  issuedAt,
}: {
  courseTitle: string;
  issuedAt: Date;
}) {
  // Take first letters of up to 3 words in course title
  const courseCode = courseTitle
    .split(" ")
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const year = issuedAt.getFullYear().toString().slice(-2);

  const random = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `ECRMI-${year}-${courseCode}-${random}`;
}

/* ================= POST ================= */

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

    /* ===== LIMIT ATTEMPTS ===== */
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

    /* ===== GRADE ===== */
    const score = gradeTest(answers, questions);
    const passed = score >= course.passMark;

    /* ===== SAVE ATTEMPT ===== */
    const attempt = await Attempt.create({
      participantName,
      participantEmail: email,
      courseId,
      answers,
      score,
      passed,
    });

    let certificateId: string | null = null;

    /* ===== CREATE CERTIFICATE ===== */
    if (passed) {
      const issuedAt = new Date();

      certificateId = generateCertificateId({
        courseTitle: course.title,
        issuedAt,
      });

      await Certificate.create({
        certificateId,
        participantName,
        participantEmail: email,
        courseId,
        courseTitle: course.title,
        score,
        attemptId: attempt._id,
        issuedAt,
      });

      /* ===== LOCK NAME ===== */
      await Participant.findOneAndUpdate(
        { email },
        { nameLocked: true }
      );

      /* ===== SEND EMAIL ===== */
      await sendCertificateEmail({
        to: email,
        name: participantName,
        certificateUrl: `https://training.ecrmi.org/verify/${certificateId}`,
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