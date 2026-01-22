"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export default function CourseCard({
  course,
}: {
  course: any;
}) {
  async function deleteCourse() {
    if (!confirm("Delete this course?")) return;

    await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: course._id }),
    });

    window.location.reload();
  }

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {course.title}
          </h2>
          <p className="text-gray-600 text-sm">
            {course.description}
          </p>

          <div className="flex gap-3 mt-3 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
              {course.durationMinutes} mins
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
              {course.passMark}% to pass
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/courses/${course._id}`}
            className="p-2 border rounded hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
          </Link>

          <button
            onClick={deleteCourse}
            className="p-2 border rounded hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/admin/courses/${course._id}`}
          className="text-teal-600 font-medium"
        >
          Manage Questions →
        </Link>
      </div>
    </div>
  );
}