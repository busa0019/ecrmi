"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [locked, setLocked] = useState(false);

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
    await fetch("/api/participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    sessionStorage.setItem("participantName", name);
    alert("Name updated successfully");
  }

  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

        {locked && (
          <p className="text-red-600 mb-4">
            Your name is locked because a certificate has been issued.
          </p>
        )}

        <label className="block text-sm mb-2">Full Name</label>
        <input
          value={name}
          disabled={locked}
          onChange={(e) => setName(e.target.value)}
          className="input mb-4"
        />

        <label className="block text-sm mb-2">Email Address</label>
        <input
          value={email || ""}
          disabled
          className="input mb-6"
          placeholder="Email Address"
          title="Email Address"
        />
        
        {!locked && (
          <button onClick={save} className="btn btn-primary">
            Save Changes
          </button>
        )}
      </div>
    </main>
  );
}