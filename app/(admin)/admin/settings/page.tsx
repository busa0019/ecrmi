"use client";

import { useState } from "react";

export default function AdminSettings() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setMessage("");

    // basic validation
    if (!currentPassword.trim()) {
      setMessage("Current password is required.");
      return;
    }
    if (!newPassword.trim() && !email.trim()) {
      setMessage("Enter a new email or a new password.");
      return;
    }
    if (newPassword.trim() && newPassword.trim().length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          currentPassword,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.error || "Update failed");
        return;
      }

      setMessage("Admin credentials updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      // optional: clear email too if you want
      // setEmail("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      <input
        className="input w-full"
        placeholder="New Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input w-full"
        type="password"
        placeholder="Current Password *"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        className="input w-full"
        type="password"
        placeholder="New Password (optional)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {message && <p className="text-sm text-slate-700">{message}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="btn btn-primary"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}