export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Attempt from "@/models/Attempt";
import Certificate from "@/models/Certificate";
import Participant from "@/models/Participant";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default async function Dashboard() {
  await connectDB();

  const participants = await Participant.countDocuments();
  const courses = await Course.countDocuments();
  const certificates = await Certificate.countDocuments();
  const attempts = await Attempt.find().lean();

  const passed = attempts.filter(a => a.passed).length;
  const failed = attempts.length - passed;
  const passRate =
    attempts.length === 0
      ? 0
      : Math.round((passed / attempts.length) * 100);

  const attentionRequired = attempts.filter(
    a => !a.passed
  ).length;

  const recentFailures = attempts
    .filter(a => !a.passed)
    .sort(
      (a: any, b: any) =>
        b.createdAt - a.createdAt
    )
    .slice(0, 5);

  return (
    <main className="p-8 space-y-12 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-600">
          Quick overview of platform activity
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <Stat icon={Users} title="Participants" value={participants} />
        <Stat icon={BookOpen} title="Courses" value={courses} />
        <Stat icon={ClipboardCheck} title="Attempts" value={attempts.length} />
        <Stat icon={Award} title="Certificates" value={certificates} />
        <Stat icon={TrendingUp} title="Pass Rate" value={`${passRate}%`} highlight />
      </div>

      {/* INSIGHTS */}
      <div className="grid md:grid-cols-3 gap-6">
        <Insight
          icon={AlertTriangle}
          title="Attention Required"
          value={attentionRequired}
          note="Participants currently failing"
          color="red"
        />

        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">
            Pass vs Fail
          </h3>
          {attempts.length === 0 ? (
            <EmptyState text="No attempts yet" />
          ) : (
            <div className="flex items-center gap-6">
              <div
                className="w-28 h-28 rounded-full"
                style={{
                  background: `conic-gradient(
                    #16a34a 0% ${passRate}%,
                    #dc2626 ${passRate}% 100%
                  )`,
                }}
              />
              <div className="text-sm space-y-1">
                <p className="text-green-700">Passed: {passed}</p>
                <p className="text-red-700">Failed: {failed}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">
            Platform Health
          </h3>
          <p className="text-sm text-slate-600">
            {passRate >= 70
              ? "✅ Performance is healthy"
              : "⚠️ Consider reviewing course content"}
          </p>
        </div>
      </div>

      {/* RECENT FAILURES */}
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">
          Recent Failed Attempts
        </h2>

        {recentFailures.length === 0 ? (
          <EmptyState text="No recent failures 🎉" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Email</th>
                <th className="text-center py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {recentFailures.map((a: any, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{a.participantName}</td>
                  <td className="py-2 text-slate-500">
                    {a.participantEmail}
                  </td>
                  <td className="text-center text-red-600 font-medium">
                    {a.score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Stat({
  icon: Icon,
  title,
  value,
  highlight = false,
}: {
  icon: any;
  title: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white border rounded-2xl p-6 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p
          className={`text-2xl font-bold ${
            highlight ? "text-teal-600" : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Insight({
  icon: Icon,
  title,
  value,
  note,
  color = "slate",
}: {
  icon: any;
  title: string;
  value: string | number;
  note: string;
  color?: "slate" | "red";
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon
          className={`w-5 h-5 ${
            color === "red" ? "text-red-600" : "text-slate-600"
          }`}
        />
        <p className="text-sm text-slate-500">{title}</p>
      </div>
      <p
        className={`text-3xl font-bold ${
          color === "red" ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1">{note}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
      <AlertTriangle className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}