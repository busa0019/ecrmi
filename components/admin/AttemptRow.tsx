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

  return (
    <tr>
      <td className="border p-3 font-medium">
        {attempt.participantName}
      </td>
      <td className="border p-3">
        {attempt.participantEmail}
      </td>
      <td className="border p-3">
        {attempt.courseTitle}
      </td>
      <td className="border p-3 text-center font-semibold">
        {attempt.lastScore}%
      </td>
      <td className="border p-3 text-center">
        {attempt.attemptsUsed}/3
      </td>
      <td className="border p-3 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            attempt.passed
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {attempt.passed ? "Passed" : "Failed"}
        </span>
      </td>
      <td className="border p-3 text-center">
        <button
          onClick={resetAttempts}
          className="text-teal-600 hover:underline"
        >
          Reset
        </button>
      </td>
    </tr>
  );
}