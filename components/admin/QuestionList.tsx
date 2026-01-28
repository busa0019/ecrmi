"use client";

import { useState } from "react";

type Question = {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

export default function QuestionList({
  questions,
}: {
  questions: Question[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Question | null>(null);

  async function saveEdit() {
    if (!draft) return;

    await fetch("/api/admin/questions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    window.location.reload();
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;

    await fetch("/api/admin/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <div
          key={q._id}
          className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm"
        >
          {editingId === q._id ? (
            <div className="space-y-3">
              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/60"
                value={draft?.question}
                onChange={(e) =>
                  setDraft({
                    ...draft!,
                    question: e.target.value,
                  })
                }
              />

              {draft?.options.map((opt, i) => (
                <input
                  key={i}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/60"
                  value={opt}
                  onChange={(e) => {
                    const copy = [...draft.options];
                    copy[i] = e.target.value;
                    setDraft({
                      ...draft,
                      options: copy,
                    });
                  }}
                />
              ))}

              <select
                className="border rounded-lg px-3 py-2"
                value={draft?.correctAnswer}
                onChange={(e) =>
                  setDraft({
                    ...draft!,
                    correctAnswer: Number(e.target.value),
                  })
                }
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="border px-3 py-1 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <p className="font-semibold">
                  Q{index + 1}: {q.question}
                </p>

                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => {
                      setEditingId(q._id);
                      setDraft(q);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteQuestion(q._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-3">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    className={`p-2 rounded-lg ${
                      q.correctAnswer === i
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
}