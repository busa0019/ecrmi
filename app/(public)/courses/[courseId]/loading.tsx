export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse w-full max-w-3xl px-6">
        <div className="h-40 bg-gray-200 rounded mb-8" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-6" />
        <div className="h-12 bg-gray-200 rounded w-40" />
      </div>
    </div>
  );
}