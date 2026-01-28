"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Lock } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [locked, setLocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("participantEmail")
      : null;

  useEffect(() => {
    if (!email) return;

    fetch(`/api/participant?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setName(data.name);
        setLocked(data.nameLocked);
      });
  }, [email]);

  async function save() {
    if (!name.trim()) return;

    setLoading(true);
    setSaved(false);

    await fetch("/api/participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    sessionStorage.setItem("participantName", name);
    setLoading(false);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-20 px-4">
      <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
        {/* ===== HEADER ===== */}
        <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Manage your personal information used for certificates.
        </p>

        {/* ===== LOCKED NOTICE ===== */}
        {locked && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              Your name is locked because a certificate has already been issued.
              To maintain certificate integrity, it can no longer be changed.
            </p>
          </div>
        )}

        {/* ===== SUCCESS MESSAGE ===== */}
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
            <CheckCircle className="w-5 h-5" />
            Your name has been updated successfully.
          </div>
        )}

        {/* ===== FORM ===== */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              value={name}
              disabled={locked}
              onChange={(e) => setName(e.target.value)}
              className={`input ${
                locked ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              value={email || ""}
              disabled
              className="input bg-gray-100 cursor-not-allowed"
              placeholder="Email Address"
            />
          </div>
        </div>

        {/* ===== ACTION ===== */}
        {!locked && (
          <div className="mt-6">
            <button
              onClick={save}
              disabled={loading || !name.trim()}
              className="btn btn-primary w-full sm:w-auto disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}