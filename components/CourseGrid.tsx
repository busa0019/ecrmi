"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Award, Lock } from "lucide-react";

export default function CourseGrid({ courses }: { courses: any[] }) {
  const [status, setStatus] = useState<Record<string, any>>({});

  useEffect(() => {
    const email = sessionStorage.getItem("participantEmail");
    if (!email) return;

    fetch("/api/attempts/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantEmail: email,
        courseIds: courses.map((c) => c._id),
      }),
    })
      .then((res) => res.json())
      .then(setStatus);
  }, [courses]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {courses.map((course) => {
        const s = status[course._id];
        const remaining = s ? 3 - s.attempts : 3;

        return (
          <div
            key={course._id}
            className="bg-white rounded-2xl border p-6 flex flex-col hover:shadow-xl transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {course.title}
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.durationMinutes} mins
              </span>
              <span>Pass mark: {course.passMark}%</span>
            </div>

            {/* ✅ STATUS BADGES */}
            {s?.passed && (
              <div className="flex items-center gap-2 text-green-600 font-medium mb-4">
                <Award className="w-4 h-4" />
                Certificate Earned
              </div>
            )}

            {!s?.passed && s?.attempts >= 3 && (
              <div className="flex items-center gap-2 text-red-600 font-medium mb-4">
                <Lock className="w-4 h-4" />
                Attempts Exhausted
              </div>
            )}

            <div className="mt-auto">
              {s?.passed ? (
                <Link
                  href="/verify"
                  className="btn btn-outline w-full"
                >
                  View Certificate
                </Link>
              ) : s?.attempts >= 3 ? (
                <span className="text-red-600 font-semibold text-center block">
                  Locked
                </span>
              ) : (
                <Link
                  href={`/courses/${course._id}`}
                  className="btn btn-primary w-full"
                >
                  {s?.attempts ? "Continue Course" : "Start Course"}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}