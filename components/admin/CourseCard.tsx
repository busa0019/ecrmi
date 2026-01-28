"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CourseCard({
  course,
}: {
  course: any;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  async function deleteCourse() {
    await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: course._id }),
    });

    window.location.reload();
  }

  return (
    <>
      {/* CARD */}
      <div className="group relative bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          {/* CONTENT */}
          <div className="space-y-1 min-w-0">
            {/* Title with tooltip */}
            <h2
              title={course.title}
              className="text-base sm:text-lg lg:text-xl font-semibold leading-snug line-clamp-3 break-normal"
            >
              {course.title}
            </h2>

            <p className="text-gray-600 text-sm line-clamp-2 break-normal">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-3 text-xs sm:text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                {course.durationMinutes} mins
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {course.passMark}% to pass
              </span>
            </div>
          </div>

          {/* ACTIONS – hover only */}
          <div className="flex gap-2 shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/admin/courses/${course._id}`}
              className="p-2 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              aria-label="Edit course"
            >
              <Pencil className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 border rounded-lg bg-white hover:bg-red-50 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              aria-label="Delete course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-4">
          <Link
            href={`/admin/courses/${course._id}`}
            className="text-teal-600 text-sm font-medium hover:underline"
          >
            Manage Questions →
          </Link>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Delete course?
            </h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. All questions
              under this course will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteCourse}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}