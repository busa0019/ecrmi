"use client";

import { useEffect, useState } from "react";
import { Award, Lock, AlertTriangle } from "lucide-react";

export default function CourseStatus({ courseId }: { courseId: string }) {
  const [status, setStatus] = useState<any>(null);

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
      .then((data) => setStatus(data[courseId]));
  }, [courseId]);

  if (!status) return null;

  const remaining = Math.max(0, 3 - (status.attempts || 0));

  if (status.passed) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium mb-6">
        <Award className="w-5 h-5" />
        You have already earned a certificate for this course.
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-medium mb-6">
        <Lock className="w-5 h-5" />
        Attempts exhausted. This course is locked.
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 font-medium mb-6 ${
        remaining === 1 ? "text-amber-600" : "text-blue-600"
      }`}
    >
      <AlertTriangle className="w-5 h-5" />
      You have <strong>{remaining}</strong>{" "}
      {remaining === 1 ? "attempt" : "attempts"} remaining.
    </div>
  );
}