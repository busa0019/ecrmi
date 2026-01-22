"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function StartPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ✅ CORRECT PLACE FOR ASYNC FUNCTION
  async function handleContinue() {
    if (!name || !email) return;

    // ✅ Save participant (or update name if allowed)
    await fetch("/api/participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    // ✅ Frontend session
    sessionStorage.setItem("participantName", name);
    sessionStorage.setItem("participantEmail", email);

    router.push("/courses");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0b1220]">
      <div className="w-full max-w-xl text-white">

        {/* HEADING */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 tracking-tight">
          <span className="block text-white">IDENTITY</span>
          <span className="block text-blue-500">VERIFICATION</span>
        </h1>

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
              <div className="mt-2 text-amber-400/80">
                Attempt limit: 3 trials per course.
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-2xl bg-[#020617] p-8 space-y-7 shadow-2xl border border-slate-800">

          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Candidate Legal Name
            </label>
            <input
              className="w-full rounded-xl bg-[#020617]/80 border border-slate-600 px-4 py-4 text-white"
              placeholder="As it appears on ID"
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
              className="w-full rounded-xl bg-[#020617]/80 border border-slate-600 px-4 py-4 text-white"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={!name || !email}
            className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 py-4 font-bold text-white transition"
          >
            INITIALIZE SESSION
          </button>
        </div>

        {/* BACK */}
        <button
          onClick={() => router.push("/")}
          className="mt-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Home
        </button>
      </div>
    </main>
  );
}