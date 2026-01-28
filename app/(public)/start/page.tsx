"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function StartPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeDetected, setResumeDetected] = useState(false);

  /* ================= MOUNT + RESUME SESSION ================= */
  useEffect(() => {
    setMounted(true);

    const savedName = sessionStorage.getItem("participantName");
    const savedEmail = sessionStorage.getItem("participantEmail");

    if (savedName && savedEmail) {
      setName(savedName);
      setEmail(savedEmail);
      setResumeDetected(true);
    }
  }, []);

  /* ================= CONTINUE ================= */
  async function handleContinue() {
    if (!name || !email || loading) return;

    setLoading(true);

    await fetch("/api/participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    sessionStorage.setItem("participantName", name);
    sessionStorage.setItem("participantEmail", email);

    router.push("/courses");
  }

  /* ================= HYDRATION GUARD ================= */
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0b1220]">
      <div className="w-full max-w-xl text-white">

        {/* HEADING */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 tracking-tight">
          <span className="block text-white">IDENTITY</span>
          <span className="block text-blue-500">VERIFICATION</span>
        </h1>

        {/* RESUME NOTICE */}
        {resumeDetected && (
          <div className="mb-6 rounded-xl bg-blue-900/30 border border-blue-600/40 p-4 text-blue-300 text-sm text-center">
            We found an existing session. You may continue or update your details.
          </div>
        )}

        {/* NOTICE */}
        <div className="mb-8 rounded-2xl bg-[#1c1917] border border-amber-500/40 p-6 text-amber-300">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 mt-1" />
            <div className="text-sm leading-relaxed">
              <strong className="block text-amber-400 mb-1">
                CRITICAL NOTICE
              </strong>
              The name and email entered below will be used on your certificate.
              Please ensure accuracy.
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-2xl bg-[#020617] p-8 space-y-7 shadow-2xl border border-slate-800">

          {/* LOCK ICON */}
          <div className="flex justify-center">
            <Lock className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Candidate Legal Name
            </label>
            <input
              className="w-full rounded-xl bg-[#020617]/80 border border-slate-600 px-4 py-4 text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="As it appears on ID"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Official Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl bg-[#020617]/80 border border-slate-600 px-4 py-4 text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-2 text-xs text-slate-400">
              Use the same email you registered with or your official organization email.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={!name || !email || loading}
            className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 py-4 font-bold text-white
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "INITIALIZING SESSION…" : "INITIALIZE SESSION"}
          </button>
        </div>

        {/* BACK */}
        <button
          onClick={() => router.push("/")}
          className="mt-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mx-auto"
        >
          
          
        </button>
      </div>
    </main>
  );
}