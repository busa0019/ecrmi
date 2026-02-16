"use client";

import { useEffect, useState } from "react";

export default function AdminTrainingCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/training-codes", { cache: "no-store" as any });
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/training-codes", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to generate code");
        return;
      }

      const code = String(data.code || "");
      setLastCode(code);

      // copy
      try {
        await navigator.clipboard.writeText(code);
      } catch {}

      await load();
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
            Used: <strong>{usedCount}</strong> • Unused: <strong>{unusedCount}</strong>
          </p>
        </div>

        <button className="btn btn-primary" onClick={generate} disabled={generating}>
          {generating ? "Generating..." : "Generate Code"}
        </button>
      </div>

      {lastCode && (
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-1">Last generated code (copied):</p>
          <div className="font-mono text-lg">{lastCode}</div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Used By (Email)</th>
              <th className="p-4 text-left">Used At</th>
              <th className="p-4 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : (
              <>
                {codes.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="p-4 font-mono">{c.code}</td>
                    <td className="p-4 capitalize">{c.status}</td>
                    <td className="p-4">{c.usedByEmail || "—"}</td>
                    <td className="p-4">
                      {c.usedAt ? new Date(c.usedAt).toLocaleString() : "—"}
                    </td>
                    <td className="p-4">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}

                {codes.length === 0 && (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan={5}>
                      No codes yet.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}