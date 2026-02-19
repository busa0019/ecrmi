"use client";

import { useEffect, useMemo, useState } from "react";

type CourseOpt = { _id: string; title: string };

export default function AdminTrainingCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseOpt[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState("");

  const [courseId, setCourseId] = useState("");

  const courseTitle = useMemo(() => {
    return courses.find((c) => c._id === courseId)?.title || "";
  }, [courses, courseId]);

  async function loadCodes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/training-codes", {
        cache: "no-store" as any,
      });
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/admin/courses/list", {
        cache: "no-store" as any,
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    loadCodes();
    loadCourses();

    // remember last selected course
    const saved = localStorage.getItem("admin_training_courseId");
    if (saved) setCourseId(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_training_courseId", courseId);
  }, [courseId]);

  async function generate() {
    const cid = courseId.trim();
    if (!cid) {
      alert("Please select a course before generating a code.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/training-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: cid }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to generate code");
        return;
      }

      const code = String(data.code || "");
      setLastCode(code);

      try {
        await navigator.clipboard.writeText(code);
      } catch {}

      await loadCodes();
    } finally {
      setGenerating(false);
    }
  }

  const usedCount = codes.filter((c) => c.status === "used").length;
  const unusedCount = codes.filter((c) => c.status === "unused").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Training Access Codes</h1>
          <p className="text-sm text-slate-600">
            Used: <strong>{usedCount}</strong> • Unused:{" "}
            <strong>{unusedCount}</strong>
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={generating || !courseId.trim()}
          title={!courseId.trim() ? "Select a course to generate a code" : ""}
        >
          {generating ? "Generating..." : "Generate Code"}
        </button>
      </div>

      {/* ✅ Course dropdown + Clear */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="text-sm font-semibold text-slate-700">
            Select Course (required)
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCourseId("")}
              disabled={!courseId}
            >
              Clear
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                loadCourses();
                loadCodes();
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          disabled={loadingCourses}
        >
          <option value="">
            {loadingCourses ? "Loading courses..." : "— Select a course —"}
          </option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>

        {!!courseId && (
          <p className="text-xs text-slate-500">
            Selected: <strong>{courseTitle || "Unknown course"}</strong> • ID:{" "}
            <span className="font-mono">{courseId}</span>
          </p>
        )}
      </div>

      {lastCode && (
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-1">
            Last generated code (copied):
          </p>
          <div className="font-mono text-lg">{lastCode}</div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Course ID</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Used By (Email)</th>
              <th className="p-4 text-left">Used At</th>
              <th className="p-4 text-left">Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={6}>
                  No codes yet.
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-4 font-mono">{c.code}</td>
                  <td className="p-4 font-mono text-xs">{c.courseId || "—"}</td>
                  <td className="p-4 capitalize">{c.status}</td>
                  <td className="p-4">{c.usedByEmail || "—"}</td>
                  <td className="p-4">
                    {c.usedAt ? new Date(c.usedAt).toLocaleString() : "—"}
                  </td>
                  <td className="p-4">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}