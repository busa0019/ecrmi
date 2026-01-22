export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Course from "@/models/Course";
import Certificate from "@/models/Certificate";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  await connectDB();

  const attempts = await Attempt.find().lean();
  const courses = await Course.find().lean();
  const certificates = await Certificate.countDocuments();

  const total = attempts.length;
  const passed = attempts.filter(a => a.passed).length;
  const failed = total - passed;
  const passRate =
    total === 0 ? 0 : Math.round((passed / total) * 100);

  // failures per course
  const failureMap: Record<string, number> = {};
  attempts.forEach((a: any) => {
    if (!a.passed && a.courseId) {
      const id = a.courseId.toString();
      failureMap[id] = (failureMap[id] || 0) + 1;
    }
  });

  const courseMap: Record<string, string> = {};
  courses.forEach((c: any) => {
    courseMap[c._id.toString()] = c.title;
  });

  const failureData = Object.entries(failureMap).map(
    ([courseId, count]) => ({
      course: courseMap[courseId] || "Unknown course",
      count,
    })
  );

  const maxFailure = Math.max(
    ...failureData.map(f => f.count),
    1
  );

  return (
    <main className="p-8 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">
            Platform performance overview
          </p>
        </div>

        {/* CSV ONLY */}
        <form action="/api/admin/analytics/export" method="GET">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            ⬇️ Export CSV
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <Stat title="Attempts" value={total} />
        <Stat title="Passed" value={passed} color="green" />
        <Stat title="Failed" value={failed} color="red" />
        <Stat title="Pass Rate" value={`${passRate}%`} />
        <Stat title="Certificates" value={certificates} />
      </div>

      {/* Pass / Fail Pie */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Pass vs Fail</h2>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full"
            style={{
              background: `conic-gradient(
                #16a34a 0% ${passRate}%,
                #dc2626 ${passRate}% 100%
              )`
            }}
          />
          <div className="text-sm space-y-1">
            <p>✅ Passed: {passed}</p>
            <p>❌ Failed: {failed}</p>
          </div>
        </div>
      </div>

      {/* Bigger Bar Chart */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">
          Courses With Highest Failures
        </h2>

        {failureData.length === 0 ? (
          <p className="text-sm text-gray-500">
            No failed attempts yet.
          </p>
        ) : (
          <div className="space-y-4">
            {failureData.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1 text-sm">
                  <span>{c.course}</span>
                  <span>{c.count}</span>
                </div>
                <div className="h-4 bg-gray-200 rounded">
                  <div
                    className="h-4 bg-red-500 rounded"
                    style={{
                      width: `${(c.count / maxFailure) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
  color = "slate",
}: {
  title: string;
  value: string | number;
  color?: "slate" | "green" | "red";
}) {
  const colors: any = {
    slate: "text-slate-700",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}