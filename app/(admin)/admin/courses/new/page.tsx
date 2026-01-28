"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [durationMinutes, setDurationMinutes] =
    useState(30);
  const [passMark, setPassMark] = useState(70);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        durationMinutes,
        passMark,
      }),
    });

    if (!res.ok) {
      alert("Failed to create course");
      setLoading(false);
      return;
    }

    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-white border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm mt-4 sm:mt-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Create New Course
      </h1>

      <input
        className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
        placeholder="Course title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <textarea
        className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
          value={durationMinutes}
          onChange={(e) =>
            setDurationMinutes(
              Number(e.target.value)
            )
          }
        />
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition"
          value={passMark}
          onChange={(e) =>
            setPassMark(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center">
        <button
          onClick={submit}
          disabled={loading}
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>

        <button
          onClick={() =>
            router.push("/admin/courses")
          }
          className="w-full sm:w-auto border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}