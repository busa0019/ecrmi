"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Award, Lock } from "lucide-react";

type Filter = "all" | "active" | "completed" | "locked";

export default function CourseGrid({ courses }: { courses: any[] }) {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<Filter>("all");

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

  /* ================= FILTER LOGIC ================= */

  const filteredCourses = courses.filter((course) => {
    const s = status[course._id];
    const exhausted = s && !s.passed && s.attempts >= 3;

    if (filter === "completed") return s?.passed;
    if (filter === "locked") return exhausted;
    if (filter === "active") return !s?.passed && !exhausted;
    return true;
  });

  /* ================= EMPTY STATE ================= */

  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-24">
        <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No courses to display
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          There are no courses matching this filter at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ===== FILTER BAR ===== */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          ["all", "All"],
          ["active", "Active"],
          ["completed", "Completed"],
          ["locked", "Locked"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as Filter)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              filter === key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== COURSE GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {filteredCourses.map((course) => {
          const s = status[course._id];
          const exhausted = s && !s.passed && s.attempts >= 3;

          const statusColor = s?.passed
            ? "bg-green-500"
            : exhausted
            ? "bg-red-500"
            : "bg-blue-500";

          return (
            <div
              key={course._id}
              title={
                exhausted
                  ? "This course is locked because you have used all 3 attempts."
                  : undefined
              }
              className={`relative bg-white rounded-2xl border flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl ${
                exhausted
                  ? "opacity-60 grayscale cursor-not-allowed"
                  : ""
              }`}
            >
              {/* ===== STATUS BAR ===== */}
              <div
                className={`absolute left-0 top-0 h-full w-1 ${statusColor}`}
              />

              {/* ===== IMAGE BANNER ===== */}
              <div className="relative h-16 w-full">
                <Image
                  src="/course-banner.jpeg"
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />

                {/* ICON OVERLAY */}
                <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* ===== CONTENT ===== */}
              <div className="pt-10 p-4 sm:p-6 flex flex-col flex-1">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  {course.title}
                </h2>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.durationMinutes} mins
                  </span>
                  <span>Pass mark: {course.passMark}%</span>
                </div>

                {/* ===== STATUS ===== */}
                {s?.passed && (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm mb-4">
                    <Award className="w-4 h-4" />
                    Certificate Earned
                  </div>
                )}

                {exhausted && (
                  <div className="flex items-center gap-2 text-red-600 font-medium text-sm mb-4">
                    <Lock className="w-4 h-4" />
                    Attempts Exhausted
                  </div>
                )}

                {/* ===== CTA ===== */}
                <div className="mt-auto">
                  {s?.passed ? (
                    <Link
                      href="/verify"
                      className="btn btn-outline w-full"
                    >
                      View Certificate
                    </Link>
                  ) : exhausted ? (
                    <div className="text-center text-sm text-gray-500">
                      Course Locked
                    </div>
                  ) : (
                    <Link
                      href={`/courses/${course._id}`}
                      className="btn btn-primary w-full"
                    >
                      {s?.attempts
                        ? "Continue Course"
                        : "Start Course"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}