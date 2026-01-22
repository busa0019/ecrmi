import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Course from "@/models/Course";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  await connectDB();

  const attempts = await Attempt.find().lean();
  const courses = await Course.find().lean();

  const courseMap: Record<string, string> = {};
  courses.forEach((c: any) => {
    courseMap[c._id.toString()] = c.title;
  });

  let csv =
    "Name,Email,Course,Score,Passed,Date\n";

  attempts.forEach((a: any) => {
    csv += `"${a.participantName}","${a.participantEmail}","${
      courseMap[a.courseId.toString()] || ""
    }",${a.score},${
      a.passed ? "Yes" : "No"
    },"${a.createdAt.toISOString()}"\n`;
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; filename="analytics.csv"',
    },
  });
}