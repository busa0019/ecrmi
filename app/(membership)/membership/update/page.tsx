"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

const MEMBERSHIP_TYPES = [
  "Affiliate Member",
  "Associate Member",
  "Technical Member",
  "Professional Fellowship",
  "Professional Membership",
  "Honorary Fellowship",
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());
}

export default function MembershipUpdatePage() {
  const [lookup, setLookup] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false); // ✅ new
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<{
    _id: string;
    fullName: string;
    email: string;
    membershipType: string; // ✅ new (needed for not-found flow)
    jobTitle: string;
    organization: string;
    natureOfWork: string;
    yearsOfExperience: string;
    cvUrl: string;
    certificatesUrl: string[]; // ✅ always array
  }>({
    _id: "",
    fullName: "",
    email: "",
    membershipType: "",
    jobTitle: "",
    organization: "",
    natureOfWork: "",
    yearsOfExperience: "",
    cvUrl: "",
    certificatesUrl: [],
  });

  /* ================= FILE UPLOAD (Cloudinary direct like apply form) ================= */
  async function uploadFile(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecrmi_unsigned");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
    if (!data.secure_url) throw new Error("Upload failed (missing secure_url)");

    return data.secure_url as string;
  }

  /* ================= FETCH EXISTING MEMBER ================= */
  async function fetchMember() {
    setError("");

    const email = lookup.trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const res = await fetch(
      `/api/membership/update?lookup=${encodeURIComponent(email)}`
    );
    const data = await res.json();

    if (!data.success) {
      // ✅ not found: allow manual entry
      setNotFound(true);
      setForm((prev) => ({
        ...prev,
        _id: "",
        email,
      }));
      setLoaded(true);
      return;
    }

    // ✅ found
    setNotFound(false);
    setForm({
      _id: data.member._id || "",
      fullName: data.member.fullName || "",
      email: data.member.email || email,
      membershipType: data.member.membershipType || "",
      jobTitle: data.member.jobTitle || "",
      organization: data.member.organization || "",
      natureOfWork: data.member.natureOfWork || "",
      yearsOfExperience: String(data.member.yearsOfExperience ?? ""),
      cvUrl: data.member.cvUrl || "",
      certificatesUrl: Array.isArray(data.member.certificatesUrl)
        ? data.member.certificatesUrl.filter(Boolean)
        : [],
    });

    setLoaded(true);
  }

  /* ================= SUBMIT UPDATE / NEW APPLICATION ================= */
  async function submitUpdate() {
    setError("");

    // ✅ If not found, we need extra required fields
    if (notFound) {
      if (!form.fullName.trim()) {
        setError("Full name is required.");
        return;
      }
      if (!form.membershipType) {
        setError("Please select a membership type.");
        return;
      }
    }

    setUploading(true);
    try {
      const res = await fetch("/api/membership/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to submit. Please try again.");
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  /* ================= SUCCESS SCREEN ================= */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">
            {notFound ? "Application Submitted" : "Update Submitted"}
          </h2>
          <p className="text-sm text-gray-600">
            {notFound
              ? "Your information has been submitted successfully for review."
              : "Your update has been submitted for review."}
          </p>
        </div>
      </main>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="max-w-3xl mx-auto">
        <div className="bg-white border rounded-xl p-6 space-y-6">
          {!loaded ? (
            <>
              <h1 className="text-xl font-semibold">Update Existing Membership</h1>

              <p className="text-sm text-gray-600">
                Enter your email address to load your record.
              </p>

              <input
                className="input w-full"
                placeholder="Email address"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
              />

              <button onClick={fetchMember} className="btn btn-primary w-full">
                Continue
              </button>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                {notFound ? "No Record Found — Submit Your Details" : "Update Your Information"}
              </h2>

              {notFound && (
                <p className="text-sm text-slate-600">
                  We couldn’t find your record. You can fill your details below and submit for review.
                </p>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              <input
                className="input w-full"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />

              {/* ✅ membership type only needed when notFound */}
              {notFound ? (
                <select
                  className="input w-full"
                  value={form.membershipType}
                  onChange={(e) =>
                    setForm({ ...form, membershipType: e.target.value })
                  }
                >
                  <option value="">Select membership type *</option>
                  {MEMBERSHIP_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                  <span className="text-slate-600">Membership Type: </span>
                  <span className="font-semibold text-slate-900">
                    {form.membershipType || "—"}
                  </span>
                </div>
              )}

              <input
                className="input w-full"
                placeholder="Job Title"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />

              <input
                className="input w-full"
                placeholder="Organization"
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Nature of Work"
                value={form.natureOfWork}
                onChange={(e) =>
                  setForm({ ...form, natureOfWork: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Years of Experience"
                value={form.yearsOfExperience}
                onChange={(e) =>
                  setForm({ ...form, yearsOfExperience: e.target.value })
                }
              />

              {/* ✅ SHOW EXISTING DOCUMENTS (only if found) */}
              {!notFound && (
                <div className="space-y-2 mt-4">
                  <h3 className="font-semibold">Existing Documents</h3>

                  {form.cvUrl ? (
                    <a
                      href={form.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline block"
                    >
                      View Existing CV
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No CV on record.</p>
                  )}

                  {form.certificatesUrl.length > 0 ? (
                    <details className="rounded-lg border bg-slate-50 p-3">
                      <summary className="cursor-pointer font-medium">
                        View Existing Certificates ({form.certificatesUrl.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {form.certificatesUrl.map((url, idx) => (
                          <a
                            key={url + idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline block text-sm"
                          >
                            Certificate {idx + 1}
                          </a>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No certificates on record.
                    </p>
                  )}
                </div>
              )}

              {/* ✅ UPLOAD SECTION */}
              <div className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Upload Updated CV</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="block w-full"
                    disabled={uploading}
                    onChange={async (e) => {
                      const input = e.currentTarget; // ✅ capture input (fixes null error)
                      const file = input.files?.[0];
                      if (!file) return;

                      setError("");
                      setUploading(true);
                      try {
                        const url = await uploadFile(file);
                        setForm((prev) => ({ ...prev, cvUrl: url }));
                      } catch (err: any) {
                        setError(err?.message || "CV upload failed");
                      } finally {
                        setUploading(false);
                        input.value = ""; // ✅ safe reset
                      }
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Upload Certificates (optional, multiple allowed)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.png"
                    className="block w-full"
                    disabled={uploading}
                    onChange={async (e) => {
                      const input = e.currentTarget; // ✅ capture input (fixes null error)
                      const files = Array.from(input.files || []);
                      if (!files.length) return;

                      setError("");
                      setUploading(true);
                      try {
                        const urls = await Promise.all(files.map(uploadFile));
                        setForm((prev) => ({
                          ...prev,
                          certificatesUrl: [...prev.certificatesUrl, ...urls],
                        }));
                      } catch (err: any) {
                        setError(err?.message || "Certificates upload failed");
                      } finally {
                        setUploading(false);
                        input.value = ""; // ✅ safe reset
                      }
                    }}
                  />
                </div>
              </div>

              <button
                disabled={uploading}
                onClick={submitUpdate}
                className="btn btn-primary w-full mt-4"
              >
                {uploading
                  ? "Uploading…"
                  : notFound
                  ? "Submit Details"
                  : "Submit Update"}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}