"use client";

type Props = {
  question: {
    question: string;
    options: string[];
  };
  index: number;
  selected: number | null;
  onSelect: (value: number) => void;
};

export default function QuestionCard({
  question,
  index,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
      {/* QUESTION TEXT */}
      <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-6">
        {index + 1}. {question.question}
      </h2>

      {/* OPTIONS */}
      <div className="space-y-3">
        {question.options.map((opt: string, i: number) => (
          <label
            key={i}
            className={`
              flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
              ${
                selected === i
                  ? "border-teal-600 bg-teal-50 text-teal-900"
                  : "border-gray-300 bg-white hover:bg-gray-50 text-slate-800"
              }
            `}
          >
            <input
              type="radio"
              name={`q-${index}`}
              checked={selected === i}
              onChange={() => onSelect(i)}
              className="accent-teal-600"
            />
            <span className="text-sm md:text-base">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}