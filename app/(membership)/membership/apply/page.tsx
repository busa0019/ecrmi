"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

const steps = [
  "Personal Information",
  "Membership Type",
  "Education & Experience",
  "Documents & Declaration",
  "Review & Submit",
];

const MEMBERSHIP_TYPES = [
  "Student Member",
  "Affiliate Member",
  "Graduate Member",
  "Associate Member",
  "Technical Member",
  "Professional Member",
  "Fellow",
  "Honorary Member",
];

export default function MembershipApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<any>({
    fullName: "",
    email: "",
    nationality: "",
    state: "",
    dob: "",
    membershipType: "",
    jobTitle: "",
    organization: "",
    natureOfWork: "",
    yearsOfExperience: "",
    passportPhotoUrl: "",
    cvUrl: "",
    certificateUrls: [] as string[],
    paymentReceiptUrl: "",
    declaration: false,
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
    return json.url as string;
  }

  /* ================= NAVIGATION ================= */
  function next() {
    setError("");

    if (step === 0 && (!form.fullName || !form.email)) {
      setError("Full name and email are required.");
      return;
    }

    if (step === 1 && !form.membershipType) {
      setError("Please select a membership type.");
      return;
    }

    if (step === 3 && !form.declaration) {
      setError("You must accept the declaration to continue.");
      return;
    }

    setStep(step + 1);
  }

  function back() {
    setError("");
    setStep(step - 1);
  }

  async function submit() {
    setUploading(true);

    await fetch("/api/membership/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setUploading(false);
    setSubmitted(true);
  }

  /* ================= SUCCESS ================= */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Application Submitted
          </h2>
          <p className="text-gray-600 text-sm">
            Your membership application has been submitted successfully.
            Please check back in 24–48 hours for approval status.
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
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />

              <input
                required
                className="input w-full"
                placeholder="Email Address *"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Nationality"
                onChange={(e) =>
                  setForm({ ...form, nationality: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="State (if Nigeria)"
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value })
                }
              />

              <input
                type="date"
                className="input w-full"
                onChange={(e) =>
                  setForm({ ...form, dob: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({
                    ...form,
                    membershipType: e.target.value,
                  })
                }
              >
                <option value="">Select membership type *</option>
                {MEMBERSHIP_TYPES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold">
                Education & Experience
              </h2>

              <input
                className="input w-full"
                placeholder="Job Title"
                onChange={(e) =>
                  setForm({ ...form, jobTitle: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Organization"
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Nature of Work"
                onChange={(e) =>
                  setForm({ ...form, natureOfWork: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Years of Experience"
                onChange={(e) =>
                  setForm({
                    ...form,
                    yearsOfExperience: e.target.value,
                  })
                }
              />
            </>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold">
                Documents & Declaration
              </h2>

              <label className="text-sm font-medium">
                Passport Photograph
              </label>
              <input
                type="file"
                accept=".jpg,.png"
                className="input w-full"
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  setUploading(true);
                  const url = await uploadFile(e.target.files[0]);
                  setForm({ ...form, passportPhotoUrl: url });
                  setUploading(false);
                }}
              />

              <label className="text-sm font-medium">
                Curriculum Vitae (CV)
              </label>
              <input
                type="file"
                accept=".pdf"
                className="input w-full"
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  setUploading(true);
                  const url = await uploadFile(e.target.files[0]);
                  setForm({ ...form, cvUrl: url });
                  setUploading(false);
                }}
              />

              <label className="text-sm font-medium">
                Certificates (multiple allowed)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.png"
                className="input w-full"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;

                  setUploading(true);
                  const urls = await Promise.all(
                    files.map(uploadFile)
                  );

                  setForm({
                    ...form,
                    certificateUrls: urls,
                  });

                  setUploading(false);
                }}
              />

              <p className="text-xs text-gray-500">
                Accepted formats: PDF, JPG, PNG (max 5MB each)
              </p>

              <label className="text-sm font-medium">
                Payment Receipt
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                className="input w-full"
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  setUploading(true);
                  const url = await uploadFile(e.target.files[0]);
                  setForm({ ...form, paymentReceiptUrl: url });
                  setUploading(false);
                }}
              />

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      declaration: e.target.checked,
                    })
                  }
                />
                I declare that the information provided is true
                and correct.
              </label>
            </>
          )}

          {/* STEP 5 */}
          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold">
                Review & Submit
              </h2>

              <p><strong>Name:</strong> {form.fullName}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Membership:</strong> {form.membershipType}</p>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex justify-between">
            {step > 0 && (
              <button
                onClick={back}
                className="btn btn-outline"
              >
                Back
              </button>
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