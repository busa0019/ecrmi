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
    <div className="max-w-3xl bg-white border rounded-xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        Create New Course
      </h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="Course title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          className="border p-2 rounded"
          value={durationMinutes}
          onChange={(e) =>
            setDurationMinutes(
              Number(e.target.value)
            )
          }
        />
        <input
          type="number"
          className="border p-2 rounded"
          value={passMark}
          onChange={(e) =>
            setPassMark(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="bg-teal-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>

        <button
          onClick={() =>
            router.push("/admin/courses")
          }
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}