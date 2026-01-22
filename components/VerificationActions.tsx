"use client";

import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { copyText } from "@/components/utils/copyText";

export default function VerificationActions({
  certificateId,
}: {
  certificateId: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const ok = copyText(certificateId);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="border rounded-2xl p-4 flex items-center justify-between gap-4 mt-8 relative">
      {/* ✅ TOAST */}
      {copied && (
        <div className="absolute -top-8 right-0 bg-emerald-600 text-white text-xs px-3 py-1 rounded">
          ✅ Copied
        </div>
      )}

      <div>
        <p className="font-semibold mb-1">Verification Code</p>
        <input
          readOnly
          value={certificateId}
          className="font-mono text-sm bg-gray-50 border rounded px-3 py-2 w-[280px]"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="btn btn-outline"
          title="Copy code"
        >
          <Copy className="w-4 h-4" />
        </button>

        <a
          href={`/api/certificates/${certificateId}`}
          className="btn btn-primary"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </a>
      </div>
    </div>
  );
}