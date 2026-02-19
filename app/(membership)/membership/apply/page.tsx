"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

const steps = [
  "Personal Information",
  "Membership Type",
  "Education & Experience",
  "Documents & Declaration",
  "Review & Submit",
];

// ✅ label shows price, value stays clean (what you store in DB)
const MEMBERSHIP_TYPES: { value: string; label: string }[] = [
  { value: "Affiliate Member", label: "Affiliate Member (₦65,000)" },
  { value: "Associate Member", label: "Associate Member (₦75,000)" },
  { value: "Technical Member", label: "Technical Member (₦100,000)" },
  { value: "Professional Fellowship", label: "Professional Fellowship (₦200,000)" },
  { value: "Professional Membership", label: "Professional Membership (₦120,000)" },
  { value: "Honorary Membership", label: "Honorary Membership (Free)" },
];

function isValidEmail(email: string) {
  // simple + practical validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function MembershipApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dob: "",
    membershipType: "",
    jobTitle: "",
    organization: "",

    // uploads
    cvUrl: "",
    certificateUrls: [] as string[],
    paymentReceiptUrl: "",

    declaration: false,
  });

  const selectedMembershipLabel =
    MEMBERSHIP_TYPES.find((m) => m.value === form.membershipType)?.label ||
    form.membershipType ||
    "—";

  /* ================= FILE UPLOAD ================= */
  async function uploadFile(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecrmi_unsigned");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary upload failed:", data);
      throw new Error(data?.error?.message || "Upload failed");
    }

    if (!data.secure_url) {
      console.error("Cloudinary response missing secure_url:", data);
      throw new Error("Upload failed");
    }

    return data.secure_url as string;
  }

  /* ================= NAVIGATION ================= */
  function next() {
    setError("");

    if (step === 0) {
      if (!form.fullName.trim()) {
        setError("Full name is required.");
        return;
      }
      if (!form.email.trim()) {
        setError("Email is required.");
        return;
      }
      if (!isValidEmail(form.email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    if (step === 1 && !form.membershipType) {
      setError("Please select a membership type.");
      return;
    }

    if (step === 3) {
      if (!form.declaration) {
        setError("You must accept the declaration to continue.");
        return;
      }
      // optional rule: require at least one document
      if (
        !form.cvUrl &&
        form.certificateUrls.length === 0 &&
        !form.paymentReceiptUrl
      ) {
        setError(
          "Please upload at least one document (CV, certificate, or receipt)."
        );
        return;
      }
    }

    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setError("");
    setUploading(true);

    try {
      // ✅ keep your original keys, but also send aliases to match schema
      const payload = {
        ...form,
        requestedMembershipType: form.membershipType, // ✅ this is now clean value (no price)
        certificatesUrl: form.certificateUrls, // schema-friendly alias
      };

      const res = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit application");
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeCertificate(index: number) {
    setForm((prev) => ({
      ...prev,
      certificateUrls: prev.certificateUrls.filter((_, i) => i !== index),
    }));
  }

  /* ================= SUCCESS ================= */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Application Submitted</h2>
          <p className="text-gray-600 text-sm">
            Your membership application has been submitted successfully. Please
            check back in 24–48 hours for approval status.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <section className="max-w-4xl mx-auto px-4 py-10">
        {/* ================= STEPS ================= */}
        <div className="flex justify-between mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                  i <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        {/* ================= FORM ================= */}
        <div className="bg-white border rounded-xl p-6 space-y-6">
          {/* STEP 1 */}
          {step === 0 && (
            <>
              <h2 className="text-xl font-semibold">Personal Information</h2>

              <input
                required
                className="input w-full"
                placeholder="Full Name *"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />

              <input
                required
                type="email"
                className="input w-full"
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="date"
                className="input w-full"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold">Membership Type</h2>

              <select
                required
                className="input w-full"
                value={form.membershipType}
                onChange={(e) =>
                  setForm({ ...form, membershipType: e.target.value })
                }
              >
                <option value="">Select membership type *</option>

                {MEMBERSHIP_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold">Education & Experience</h2>

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
            </>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold">Documents & Declaration</h2>

              <label className="text-sm font-medium">
                Curriculum Vitae (CV) (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                className="input w-full"
                disabled={uploading}
                onChange={async (e) => {
                  const input = e.currentTarget; // ✅ capture before await
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
              {form.cvUrl && (
                <p className="text-xs text-green-700">
                  CV uploaded successfully.
                </p>
              )}

              <label className="text-sm font-medium">
                Certificates (multiple allowed)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.png"
                className="input w-full"
                disabled={uploading}
                onChange={async (e) => {
                  const input = e.currentTarget; // ✅ capture before await
                  const files = Array.from(input.files || []);
                  if (!files.length) return;

                  setError("");
                  setUploading(true);
                  try {
                    const urls = await Promise.all(files.map(uploadFile));

                    // ✅ append (so user can add more later without losing earlier uploads)
                    setForm((prev) => ({
                      ...prev,
                      certificateUrls: [...prev.certificateUrls, ...urls],
                    }));
                  } catch (err: any) {
                    setError(err?.message || "Certificates upload failed");
                  } finally {
                    setUploading(false);
                    input.value = ""; // ✅ safe reset
                  }
                }}
              />

              {form.certificateUrls.length > 0 && (
                <div className="bg-slate-50 border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">
                    Uploaded certificates: {form.certificateUrls.length}
                  </p>
                  <ul className="space-y-2">
                    {form.certificateUrls.map((url, idx) => (
                      <li
                        key={url + idx}
                        className="flex items-center justify-between gap-3"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 underline truncate"
                        >
                          View document {idx + 1}
                        </a>
                        <button
                          type="button"
                          className="text-xs text-red-600 flex items-center gap-1"
                          onClick={() => removeCertificate(idx)}
                        >
                          <X className="w-4 h-4" /> Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Accepted formats: PDF, JPG, PNG
              </p>
               
               <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-b from-amber-50 to-white p-4 sm:p-5">
  <div className="flex items-start gap-3">
    <div className="mt-0.5 rounded-xl bg-amber-100 p-2">
      <AlertTriangle className="w-5 h-5 text-amber-700" />
    </div>

    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-slate-900">Payment Required</p>
        <span className="inline-flex items-center rounded-full bg-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-900">
          Form Fee: ₦10,000
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-700">
        Please pay the <strong>total amount</strong>:
        <strong> (selected membership fee + ₦10,000 form fee)</strong> and upload
        your payment receipt.
      </p>

      <div className="mt-3 grid gap-1 text-sm text-slate-800">
        <p>
          <strong>Bank:</strong> UBA
        </p>
        <p>
          <strong>Account Name:</strong> Emergency, Crisis &amp; Risk Management
          Institute (ECRMI)
        </p>
        <p>
          <strong>Account Number:</strong> 1013635573
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        <strong>Selected Membership:</strong> {selectedMembershipLabel}
      </p>
    </div>
  </div>
</div>
    
              <label className="text-sm font-medium">
                 Payment Receipt (Required — Membership Fee + ₦10,000 Form Fee)
              </label>

              <input
                type="file"
                accept=".pdf,.jpg,.png"
                className="input w-full"
                disabled={uploading}
                onChange={async (e) => {
                  const input = e.currentTarget; // ✅ capture before await
                  const file = input.files?.[0];
                  if (!file) return;

                  setError("");
                  setUploading(true);
                  try {
                    const url = await uploadFile(file);
                    setForm((prev) => ({ ...prev, paymentReceiptUrl: url }));
                  } catch (err: any) {
                    setError(err?.message || "Receipt upload failed");
                  } finally {
                    setUploading(false);
                    input.value = ""; // ✅ safe reset
                  }
                }}
              />
              {form.paymentReceiptUrl && (
                <p className="text-xs text-green-700">
                  Receipt uploaded successfully.
                </p>
              )}

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.declaration}
                  onChange={(e) =>
                    setForm({ ...form, declaration: e.target.checked })
                  }
                />
                I declare that the information provided is true and correct.
              </label>
            </>
          )}

          {/* STEP 5 */}
          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold">Review & Submit</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Personal */}
                <div className="rounded-xl border bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Personal
                  </h3>

                  <dl className="space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-600">Full Name</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {form.fullName || "—"}
                      </dd>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-600">Email</dt>
                      <dd className="font-medium text-slate-900 text-right break-all">
                        {form.email || "—"}
                      </dd>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-600">Date of Birth</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {form.dob || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Membership */}
                <div className="rounded-xl border bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Membership
                  </h3>

                  <dl className="space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-600">Type</dt>
                      <dd className="text-right">
                        <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700">
                          {selectedMembershipLabel}
                        </span>
                      </dd>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-600">Job Title</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {form.jobTitle || "—"}
                      </dd>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-600">Organization</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {form.organization || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Documents */}
                <div className="rounded-xl border bg-slate-50 p-4 sm:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Documents
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* CV */}
                    <div className="rounded-lg border bg-white p-3">
                      <p className="text-xs text-slate-600 mb-2">CV</p>
                      {form.cvUrl ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-full bg-green-600/10 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Uploaded
                          </span>
                          <a
                            href={form.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-blue-600 underline"
                          >
                            View
                          </a>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-600/10 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Not uploaded
                        </span>
                      )}
                    </div>

                    {/* Certificates (dropdown) */}
                    <div className="rounded-lg border bg-white p-3">
                      <p className="text-xs text-slate-600 mb-2">Certificates</p>

                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {form.certificateUrls.length} uploaded
                        </span>

                        {form.certificateUrls.length > 0 ? (
                          <details className="relative">
                            <summary className="list-none cursor-pointer select-none text-xs font-semibold text-blue-600 underline">
                              View
                            </summary>

                            <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border bg-white shadow-lg">
                              <div className="max-h-56 overflow-auto p-2">
                                {form.certificateUrls.map((url, idx) => (
                                  <a
                                    key={url + idx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-md px-2 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                  >
                                    Certificate {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </details>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>

                      {form.certificateUrls.length > 0 && (
                        <p className="mt-2 text-[11px] text-slate-500">
                          Tip: Clicking any item opens it in a new tab.
                        </p>
                      )}
                    </div>

                    {/* Receipt */}
                    <div className="rounded-lg border bg-white p-3">
                      <p className="text-xs text-slate-600 mb-2">
                        Payment Receipt
                      </p>
                      {form.paymentReceiptUrl ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-full bg-green-600/10 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Uploaded
                          </span>
                          <a
                            href={form.paymentReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-blue-600 underline"
                          >
                            View
                          </a>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-600/10 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Not uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Declaration */}
                <div className="rounded-xl border bg-white p-4 sm:col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Declaration
                      </h3>
                      <p className="text-xs text-slate-500">
                        Confirm you have accepted the declaration in the
                        previous step.
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        form.declaration
                          ? "bg-green-600/10 text-green-700"
                          : "bg-rose-600/10 text-rose-700"
                      }`}
                    >
                      {form.declaration ? "Accepted" : "Not accepted"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex justify-between">
            {step > 0 ? (
              <button
                onClick={back}
                className="btn btn-outline"
                disabled={uploading}
              >
                Back
              </button>
            ) : (
              <span />
            )}

            <button
              onClick={step < 4 ? next : submit}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading
                ? "Uploading…"
                : step < 4
                ? "Next"
                : "Submit Application"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}