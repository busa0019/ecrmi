export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Course from "@/models/Course";
import AttemptRow from "@/components/admin/AttemptRow";

export default async function AttemptsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  await connectDB();

  const attemptsRaw = await Attempt.find()
    .sort({ createdAt: -1 })
    .lean();

  const courses = await Course.find().lean();
  const courseMap: Record<string, string> = {};
  courses.forEach((c: any) => {
    courseMap[c._id.toString()] = c.title;
  });

  const grouped: Record<string, any> = {};

  for (const a of attemptsRaw) {
    const key =
      a.participantEmail +
      "_" +
      a.courseId.toString();

    if (!grouped[key]) {
      grouped[key] = {
        participantName: a.participantName,
        participantEmail: a.participantEmail,
        courseId: a.courseId.toString(),
        courseTitle:
          courseMap[a.courseId.toString()] || "—",
        attemptsUsed: 0,
        lastScore: a.score,
        lastDate: a.createdAt,
        passed: false,
      };
    }

    grouped[key].attemptsUsed += 1;

    if (a.passed) {
      grouped[key].passed = true;
    }

    if (a.createdAt > grouped[key].lastDate) {
      grouped[key].lastScore = a.score;
      grouped[key].lastDate = a.createdAt;
    }
  }

  const rows = Object.values(grouped).map(
    (r: any) => ({
      ...r,
      lastDate: r.lastDate.toISOString(),
    })
  );

  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          All Students
        </h1>

        {/* ✅ Styled Export Button */}
        <form
          action="/api/admin/attempts/export"
          method="GET"
        >
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50">
            ⬇️ Export CSV
          </button>
        </form>
      </div>

      <table className="w-full border text-sm bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-3 text-left">Name</th>
            <th className="border p-3 text-left">Email</th>
            <th className="border p-3 text-left">Course</th>
            <th className="border p-3">Score</th>
            <th className="border p-3">Attempts</th>
            <th className="border p-3">Status</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <AttemptRow
              key={
                row.participantEmail +
                row.courseId
              }
              attempt={row}
            />
          ))}
        </tbody>
      </table>
    </main>
  );
}