"use client";

type AttemptRowProps = {
  attempt: {
    participantName: string;
    participantEmail: string;
    courseId: string;
    courseTitle: string;
    attemptsUsed: number;
    lastScore: number;
    lastDate: string;
    passed: boolean;
  };
};

export default function AttemptRow({
  attempt,
}: AttemptRowProps) {
  async function resetAttempts() {
    const ok = confirm(
      `Reset attempts for ${attempt.participantEmail}?`
    );
    if (!ok) return;

    await fetch("/api/admin/attempts/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantEmail:
          attempt.participantEmail,
        courseId: attempt.courseId,
      }),
    });

    window.location.reload();
  }

  const attemptColor =
    attempt.attemptsUsed === 1
      ? "text-slate-700"
      : attempt.attemptsUsed === 2
      ? "text-amber-600"
      : "text-red-600";

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="border p-3 font-medium whitespace-nowrap">
        {attempt.participantName}
      </td>

      <td className="border p-3 text-slate-600 break-all">
        {attempt.participantEmail}
      </td>

      <td className="border p-3 min-w-[240px]">
        {attempt.courseTitle}
      </td>

      <td className="border p-3 text-center font-semibold">
        {attempt.lastScore}%
      </td>

      <td
        className={`border p-3 text-center font-medium ${attemptColor}`}
      >
        {attempt.attemptsUsed}/3
      </td>

      {/* ✅ Hydration-safe date */}
      <td className="border p-3 text-center text-xs text-slate-500">
        {attempt.lastDate.slice(0, 10)}
      </td>

      <td className="border p-3 text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            attempt.passed
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {attempt.passed ? "Passed" : "Failed"}
        </span>
      </td>

      <td className="border p-3 text-center">
        {attempt.attemptsUsed === 0 ? (
          <span className="text-xs text-slate-400">
            No attempts
          </span>
        ) : (
          <button
            onClick={resetAttempts}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
          >
            Reset
          </button>
        )}
      </td>
    </tr>
  );
}