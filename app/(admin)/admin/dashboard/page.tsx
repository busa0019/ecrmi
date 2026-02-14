export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Attempt from "@/models/Attempt";
import Certificate from "@/models/Certificate";
import Participant from "@/models/Participant";
import Member from "@/models/Member";
import MembershipApplication from "@/models/MembershipApplication";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  await connectDB();

  const participants = await Participant.countDocuments();
  const courses = await Course.countDocuments();
  const certificates = await Certificate.countDocuments();
  const members = await Member.countDocuments();

  const pendingMemberships =
    await MembershipApplication.countDocuments({
      status: "pending",
    });

  const attempts = await Attempt.find().lean();

  const passed = attempts.filter((a: any) => a.passed).length;
  const failed = attempts.length - passed;
  const passRate =
    attempts.length === 0
      ? 0
      : Math.round((passed / attempts.length) * 100);

  const attentionRequired = attempts.filter(
    (a: any) => !a.passed
  ).length;

  const recentFailures = attempts
    .filter((a: any) => !a.passed)
    .sort(
      (a: any, b: any) =>
        b.createdAt - a.createdAt
    )
    .slice(0, 5);

  const lastUpdated = new Date().toLocaleString();

  return (
    <main className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Quick overview of platform activity
        </p>
        <p className="text-xs text-slate-400">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        <StatLink
          href="/admin/attempts"
          icon={Users}
          title="Participants"
          value={participants}
        />
        <StatLink
          href="/admin/courses"
          icon={BookOpen}
          title="Courses"
          value={courses}
        />
        <StatLink
          href="/admin/attempts"
          icon={ClipboardCheck}
          title="Attempts"
          value={attempts.length}
        />
        <StatLink
          href="/admin/certificates"
          icon={Award}
          title="Certificates"
          value={certificates}
        />
        <StatLink
          href="/admin/analytics"
          icon={TrendingUp}
          title="Pass Rate"
          value={`${passRate}%`}
          highlight
        />
        <StatLink
          href="/admin/memberships"
          icon={Users}
          title="Members"
          value={members}
        />
        <StatLink
          href="/admin/memberships"
          icon={AlertTriangle}
          title="Pending Memberships"
          value={pendingMemberships}
        />
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Insight
          icon={AlertTriangle}
          title="Attention Required"
          value={attentionRequired}
          note="Participants who failed their most recent attempt"
          color="red"
        />

        {/* PASS / FAIL */}
        <div className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="font-semibold">
            Pass vs Fail
          </h3>

          {attempts.length === 0 ? (
            <EmptyState text="No attempts yet" />
          ) : (
            <>
              <div className="flex justify-between text-sm sm:hidden">
                <span className="text-green-700">
                  Passed: {passed}
                </span>
                <span className="text-red-700">
                  Failed: {failed}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0"
                  style={{
                    background: `conic-gradient(
                      #16a34a 0% ${passRate}%,
                      #dc2626 ${passRate}% 100%
                    )`,
                  }}
                />
                <div className="hidden sm:block text-sm space-y-1">
                  <p className="text-green-700">
                    Passed: {passed}
                  </p>
                  <p className="text-red-700">
                    Failed: {failed}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PLATFORM HEALTH */}
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
          <div className="overflow-x-auto">
            <table className="min-w-[500px] w-full text-sm">
              <thead className="border-b text-slate-500">
                <tr>
                  <th className="text-left py-2 px-2">
                    Name
                  </th>
                  <th className="text-left py-2 px-2">
                    Email
                  </th>
                  <th className="text-center py-2 px-2">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentFailures.map((a: any, i: number) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2 px-2">
                      {a.participantName}
                    </td>
                    <td className="py-2 px-2 text-slate-500">
                      {a.participantEmail}
                    </td>
                    <td className="py-2 px-2 text-center text-red-600 font-medium">
                      {a.score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

/* COMPONENTS */
function StatLink({ href, icon: Icon, title, value, highlight = false }: any) {
  return (
    <Link
      href={href}
      className="bg-white border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition w-full min-w-0"
    >
      <div className="p-3 rounded-xl bg-teal-50 text-teal-600 shrink-0">
        <Icon className="w-6 h-6" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{title}</p>
        <p
          className={`text-xl font-bold ${
            highlight ? "text-teal-600" : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>
    </Link>
  );
}

function Insight({ icon: Icon, title, value, note, color = "slate" }: any) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color === "red" ? "text-red-600" : "text-slate-600"}`} />
        <p className="text-sm text-slate-500">{title}</p>
      </div>
      <p className={`text-2xl font-bold ${color === "red" ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1">{note}</p>
    </div>
  );
}

function EmptyState({ text }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
      <AlertTriangle className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm text-center">{text}</p>
    </div>
  );
}