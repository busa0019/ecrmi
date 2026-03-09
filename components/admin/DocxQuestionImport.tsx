"use client";

import { useState } from "react";

export default function DocxQuestionImport({ courseId }: { courseId: string }) {
  const [importing, setImporting] = useState(false);

  async function onPick(file: File) {
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("courseId", courseId);
      fd.append("file", file);

      const res = await fetch("/api/admin/questions/import-docx", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Import failed");

      alert(`Imported ${data.inserted} questions successfully.`);
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      <div className="font-semibold">Import Questions from Word Doc </div>
      <p className="text-sm text-slate-600">
        
      </p>

      <input
        type="file"
        accept=".docx"
        disabled={importing}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) onPick(f);
          e.currentTarget.value = "";
        }}
      />

      {importing && <p className="text-sm text-slate-500">Importing…</p>}
    </div>
  );
}