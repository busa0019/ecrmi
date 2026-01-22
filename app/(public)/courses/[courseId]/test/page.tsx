"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionCard from "@/components/CBT/QuestionCard";
import Timer from "@/components/CBT/Timer";

export default function TestPage() {
  const router = useRouter();
  const params = useParams();

  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : Array.isArray(params.courseId)
      ? params.courseId[0]
      : "";

  const participantName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("participantName")
      : null;

  const participantEmail =
    typeof window !== "undefined"
      ? sessionStorage.getItem("participantEmail")
      : null;

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ✅ INITIAL LOAD & ATTEMPT CHECK
  useEffect(() => {
    if (!participantName || !participantEmail) {
      router.push("/start");
      return;
    }

    async function init() {
      // Check attempt status
      const statusRes = await fetch("/api/attempts/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantEmail,
          courseIds: [courseId],
        }),
      });

      const status = await statusRes.json();
      const s = status[courseId];

      if (s?.attempts >= 3 && !s?.passed) {
        alert("You have exhausted your attempts for this course.");
        router.push(`/courses/${courseId}`);
        return;
      }

      // Load questions
      const res = await fetch(`/api/questions?courseId=${courseId}`);
      const data = await res.json();

      setQuestions(data);
      setAnswers(Array(data.length).fill(null));
      setLoading(false);
    }

    if (courseId) init();
  }, [courseId, participantEmail, participantName, router]);

  // ✅ SUBMIT TEST
  async function submitTest() {
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantName,
        participantEmail,
        courseId,
        answers,
      }),
    });

    const data = await res.json();
    setResult(data);
    setSubmitted(true);
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading assessment…</p>
      </main>
    );
  }

  /* ================= RESULT SCREEN ================= */

  if (submitted && result) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4">
            {result.passed ? "🎉 Congratulations!" : "❌ Assessment Failed"}
          </h1>

          <p className="text-lg mb-4">
            Your score: <strong>{result.score}%</strong>
          </p>

       {result.passed ? (
  <>
    <p className="text-green-600 mb-4">
      You have successfully passed the assessment.
    </p>

    {/* ✅ CERTIFICATE PREVIEW */}
    <div className="border rounded-xl overflow-hidden mb-6">
      <iframe
        src={`/api/certificates/${result.certificateId}`}
        className="w-full h-[420px]"
      />
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => router.push("/verify")}
        className="btn btn-primary w-full"
      >
        Go to My Certificates
      </button>

      <a
        href={`/api/certificates/${result.certificateId}`}
        className="btn btn-outline w-full"
      >
        Download PDF
      </a>
    </div>
  </>
) : (
  <>
    <p className="text-red-600 mb-6">
      You did not meet the pass mark. You may retry if attempts remain.
    </p>

    <button
      onClick={() => router.push(`/courses/${courseId}`)}
      className="btn btn-outline w-full"
    >
      Return to Course
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  /* ================= CBT UI ================= */

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Course Assessment</h1>
        <Timer seconds={300} onExpire={submitTest} />
      </div>

      <QuestionCard
        question={questions[current]}
        index={current}
        selected={answers[current]}
        onSelect={(value) => {
          const copy = [...answers];
          copy[current] = value;
          setAnswers(copy);
        }}
      />

      <div className="flex justify-between">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        {current === questions.length - 1 ? (
          <button
            onClick={submitTest}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        )}
      </div>
    </main>
  );
}