"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/* ✅ INNER COMPONENT THAT USES useSearchParams */
function AdminLoginInner() {
  const params = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("loggedOut") === "1") {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [params]);

  async function submit() {
    if (loading) return;

    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 relative">
      {/* ✅ TOAST */}
      {showToast && (
        <div className="absolute top-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow">
          ✅ You’ve been logged out
        </div>
      )}

      <div className="w-80 bg-white border rounded-xl p-6 space-y-4 shadow-sm">
        <h1 className="text-xl font-bold text-center">
          Admin Login
        </h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </div>
    </main>
  );
}

/* ✅ PAGE EXPORT WITH SUSPENSE */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <AdminLoginInner />
    </Suspense>
  );
}