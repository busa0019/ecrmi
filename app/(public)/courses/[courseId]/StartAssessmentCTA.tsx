"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, KeyRound } from "lucide-react";

export default function StartAssessmentCTA({ courseId }: { courseId: string }) {
  const router = useRouter();

  const [remaining, setRemaining] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(false);

  const email = useMemo(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("participantEmail") || "";
  }, []);

  const accessKey = `courseAccess:${courseId}`;

  const [hasCourseAccess, setHasCourseAccess] = useState(false);

  useEffect(() => {
    if (!email) return;

    // read local unlock flag for this course
    const unlocked = sessionStorage.getItem(accessKey) === "1";
    setHasCourseAccess(unlocked);

    fetch("/api/attempts/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantEmail: email,
        courseIds: [courseId],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const s = data[courseId];
        setRemaining(Math.max(0, 3 - (s?.attempts || 0)));
      });
  }, [courseId, email, accessKey]);

  async function ensureCourseAccessAndStart() {
    // if user hasn't initialized identity session
    if (!email) {
      router.push("/start");
      return;
    }

    // already unlocked
    if (hasCourseAccess) {
      router.push(`/courses/${courseId}/test`);
      return;
    }

    // otherwise ask for code
    setAccessError("");
    setAccessCode("");
    setShowAccessModal(true);
  }

  async function handleValidateAccessCode() {
    setAccessError("");
    if (!email || !accessCode || checkingAccess) return;

    setCheckingAccess(true);

    // You need to implement this API (see notes below)
    const res = await fetch("/api/course-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantEmail: email,
        courseId,
        accessCode,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setCheckingAccess(false);
      setAccessError(data?.error || "Invalid access code. Please try again.");
      return;
    }

    // mark this course as unlocked for this browser session
    sessionStorage.setItem(accessKey, "1");
    setHasCourseAccess(true);

    setCheckingAccess(false);
    setShowAccessModal(false);

    router.push(`/courses/${courseId}/test`);
  }

  if (remaining === 0) {
    return (
      <div className="text-center text-red-600 font-medium">
        Course locked. No attempts remaining.
      </div>
    );
  }

  // If remaining is null, you can still render a disabled state or allow click;
  // keeping your original behavior (allow).
  if (remaining === null || remaining > 1) {
    return (
      <>
        <button
          onClick={ensureCourseAccessAndStart}
          className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto"
        >
          Start Assessment
        </button>

        {showAccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
              <div className="flex items-center gap-2 text-blue-700 mb-4">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Enter Course Access Code</h3>
              </div>

              {accessError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
                  {accessError}
                </div>
              )}

              <input
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="e.g. ECRMI-TRN-8H2K9D"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="btn btn-outline w-full"
                  disabled={checkingAccess}
                >
                  Cancel
                </button>

                <button
                  onClick={handleValidateAccessCode}
                  className="btn btn-primary w-full"
                  disabled={!accessCode || checkingAccess}
                >
                  {checkingAccess ? "Validating..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // last attempt confirm flow (still requires course access before actual start)
  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto opacity-80 grayscale"
      >
        Start Assessment (Last Attempt)
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Final Attempt Warning</h3>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              You have <strong>1 attempt remaining</strong>.
              If you fail this attempt, the course will be locked unless reset
              by an administrator.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-outline w-full"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await ensureCourseAccessAndStart();
                }}
                className="btn btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}