"use client";

import { useState } from "react";

export default function QuestionForm({
  courseId,
}: {
  courseId: string;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!question || options.some((o) => !o)) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        question,
        options,
        correctAnswer,
      }),
    });

    window.location.reload();
  }

  return (
    <div className="bg-white border rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold">
        Add New Question
      </h2>

      <textarea
        className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition"
        placeholder="Question text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {options.map((opt, i) => (
        <input
          key={i}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition"
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => {
            const copy = [...options];
            copy[i] = e.target.value;
            setOptions(copy);
          }}
        />
      ))}

      <select
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition"
        value={correctAnswer}
        onChange={(e) =>
          setCorrectAnswer(Number(e.target.value))
        }
      >
        <option value={0}>Correct Answer: Option 1</option>
        <option value={1}>Correct Answer: Option 2</option>
        <option value={2}>Correct Answer: Option 3</option>
        <option value={3}>Correct Answer: Option 4</option>
      </select>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        {loading ? "Saving..." : "Add Question"}
      </button>
    </div>
  );
}