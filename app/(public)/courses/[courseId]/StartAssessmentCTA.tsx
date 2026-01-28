"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function StartAssessmentCTA({
  courseId,
}: {
  courseId: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem("participantEmail");
    if (!email) return;

    fetch("/api/attempts/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantEmail: email,
        courseIds: [courseId],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const s = data[courseId];
        setRemaining(Math.max(0, 3 - (s?.attempts || 0)));
      });
  }, [courseId]);

  if (remaining === 0) {
    return (
      <div className="text-center text-red-600 font-medium">
        Course locked. No attempts remaining.
      </div>
    );
  }

  if (remaining === null || remaining > 1) {
    return (
      <Link
        href={`/courses/${courseId}/test`}
        className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto"
      >
        Start Assessment
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto opacity-80 grayscale"
      >
        Start Assessment (Last Attempt)
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-lg">
                Final Attempt Warning
              </h3>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              You have <strong>1 attempt remaining</strong>.  
              If you fail this attempt, the course will be locked unless reset
              by an administrator.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-outline w-full"
              >
                Cancel
              </button>

              <Link
                href={`/courses/${courseId}/test`}
                className="btn btn-primary w-full"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}