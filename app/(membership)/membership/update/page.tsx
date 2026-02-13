"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function MembershipUpdatePage() {
  const [lookup, setLookup] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<any>({
    _id: "",
    fullName: "",
    email: "",
    jobTitle: "",
    organization: "",
    natureOfWork: "",
    yearsOfExperience: "",
    cvUrl: "",
    certificatesUrl: "",
  });

  /* ================= FILE UPLOAD ================= */
  async function uploadFile(file: File) {
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/membership/upload", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    return json.url;
  }

  /* ================= FETCH EXISTING MEMBER ================= */
  async function fetchMember() {
    setError("");

    const res = await fetch(
      `/api/membership/update?lookup=${lookup}`
    );

    const data = await res.json();

    if (!data.success) {
      // allow manual entry if not found
      setForm({
        ...form,
        email: lookup,
      });
      setLoaded(true);
      return;
    }

    setForm(data.member);
    setLoaded(true);
  }

  /* ================= SUBMIT UPDATE ================= */
  async function submitUpdate() {
    setUploading(true);

    await fetch("/api/membership/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setUploading(false);
    setSubmitted(true);
  }

  /* ================= SUCCESS SCREEN ================= */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">
            Update Submitted
          </h2>
          <p className="text-sm text-gray-600">
            Your update has been submitted for review.
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
              <h1 className="text-xl font-semibold">
                Update Existing Membership
              </h1>

              <p className="text-sm text-gray-600">
                Enter your email address to load your record.
              </p>

              <input
                className="input w-full"
                placeholder="Email address"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
              />

              <button
                onClick={fetchMember}
                className="btn btn-primary w-full"
              >
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
                Update Your Information
              </h2>

              <input
                className="input w-full"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Job Title"
                value={form.jobTitle}
                onChange={(e) =>
                  setForm({ ...form, jobTitle: e.target.value })
                }
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
                  setForm({
                    ...form,
                    yearsOfExperience: e.target.value,
                  })
                }
              />

              {/* ✅ SHOW EXISTING DOCUMENTS */}
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold">Existing Documents</h3>

                {form.cvUrl && (
                  <a
                    href={form.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline block"
                  >
                    View Existing CV
                  </a>
                )}

                {form.certificatesUrl && (
                  <a
                    href={form.certificatesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline block"
                  >
                    View Existing Certificates
                  </a>
                )}
              </div>

              {/* ✅ UPLOAD SECTION */}
              <div className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Upload Updated CV
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="block w-full"
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      setUploading(true);
                      const url = await uploadFile(e.target.files[0]);
                      setForm({ ...form, cvUrl: url });
                      setUploading(false);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Upload Certificates (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="block w-full"
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      setUploading(true);
                      const url = await uploadFile(e.target.files[0]);
                      setForm({
                        ...form,
                        certificatesUrl: url,
                      });
                      setUploading(false);
                    }}
                  />
                </div>
              </div>

              <button
                disabled={uploading}
                onClick={submitUpdate}
                className="btn btn-primary w-full mt-4"
              >
                {uploading ? "Uploading…" : "Submit Update"}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}