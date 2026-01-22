"use client";

import { useState } from "react";

export default function AdminSettings() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function save() {
    setMessage("");

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        currentPassword,
        newPassword,
      }),
    });

    if (!res.ok) {
      setMessage("Update failed");
      return;
    }

    setMessage("✅ Admin credentials updated");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <main className="max-w-xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        Admin Settings
      </h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="New Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {message && (
        <p className="text-sm">{message}</p>
      )}

      <button
        onClick={save}
        className="bg-teal-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </main>
  );
}