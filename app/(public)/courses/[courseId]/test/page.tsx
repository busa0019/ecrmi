"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionCard from "@/components/CBT/QuestionCard";
import Timer from "@/components/CBT/Timer";
import { AlertTriangle } from "lucide-react";

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
  const [showReview, setShowReview] = useState(false);

  /* ================= RESTORE STATE ================= */
  useEffect(() => {
    const saved = sessionStorage.getItem(`test-${courseId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrent(parsed.current);
      setAnswers(parsed.answers);
    }
  }, [courseId]);

  /* ================= SAVE STATE ================= */
  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem(
        `test-${courseId}`,
        JSON.stringify({ current, answers })
      );
    }
  }, [current, answers, questions, courseId]);

  /* ================= INITIAL LOAD & ATTEMPT CHECK ================= */
  useEffect(() => {
    if (!participantName || !participantEmail) {
      router.push("/start");
      return;
    }

    async function init() {
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
        router.push(`/courses/${courseId}`);
        return;
      }

      const res = await fetch(`/api/questions?courseId=${courseId}`);
      const data = await res.json();

      setQuestions(data);
      setAnswers(Array(data.length).fill(null));
      setLoading(false);
    }

    if (courseId) init();
  }, [courseId, participantEmail, participantName, router]);

  /* ================= SUBMIT ================= */
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

    sessionStorage.removeItem(`test-${courseId}`);

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

  /* ================= RESULT ================= */
  if (submitted && result) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white p-10 rounded-xl shadow-lg max-w-xl w-full text-center">
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
              {result.certificateId && (
                <div className="border rounded-xl overflow-hidden mb-6">
                  <iframe
                    src={`/api/certificates/${result.certificateId}`}
                    className="w-full h-[420px]"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
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

  /* ================= REVIEW SCREEN ================= */
  if (showReview) {
    const unanswered = answers
      .map((a, i) => (a === null ? i + 1 : null))
      .filter(Boolean);

    return (
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Review Answers</h1>

        {unanswered.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">
            <AlertTriangle className="inline w-4 h-4 mr-2" />
            Unanswered questions: {unanswered.join(", ")}
          </div>
        )}

        <ul className="space-y-3">
          {questions.map((_, i) => (
            <li
              key={i}
              className={`p-4 border rounded-lg ${
                answers[i] === null
                  ? "border-red-400"
                  : "border-green-400"
              }`}
            >
              <strong>Question {i + 1}:</strong>{" "}
              {answers[i] === null ? "Not answered" : "Answered"}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button
            onClick={() => setShowReview(false)}
            className="btn btn-outline w-full"
          >
            Go Back
          </button>

          <button
            onClick={submitTest}
            disabled={unanswered.length > 0}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            Submit Assessment
          </button>
        </div>
      </main>
    );
  }

  /* ================= CBT UI ================= */
  const progress = Math.round(((current + 1) / questions.length) * 100);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Course Assessment</h1>
          <p className="text-sm text-gray-500">
            Question {current + 1} of {questions.length}
          </p>
        </div>

        <Timer seconds={300} onExpire={submitTest} />
      </div>

      <div className="w-full bg-gray-200 h-2 rounded">
        <div
          className="bg-blue-600 h-2 rounded"
          style={{ width: `${progress}%` }}
        />
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

      <div className="flex gap-3">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="btn btn-outline w-full"
        >
          Previous
        </button>

        {current === questions.length - 1 ? (
          <button
            onClick={() => setShowReview(true)}
            className="btn btn-primary w-full"
          >
            Review Answers
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="btn btn-primary w-full"
          >
            Next
          </button>
        )}
      </div>
    </main>
  );
}