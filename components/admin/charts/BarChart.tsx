"use client";

export default function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm">
            <span>{d.label}</span>
            <span>{d.value}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-teal-600 rounded"
              style={{
                width: `${(d.value / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}