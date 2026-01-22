import Link from "next/link";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { FileText, AlertTriangle } from "lucide-react";

export default async function CourseIntroPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  await connectDB();
  const course = await Course.findById(courseId).lean();

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Course not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            {course.title}
          </h1>

          <p className="text-gray-600 mb-6 text-lg">
            {course.description}
          </p>

          {course.facilitator && (
            <p className="text-sm text-gray-500 mb-6">
              <strong>Facilitator:</strong> {course.facilitator}
            </p>
          )}

          {/* INFO CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
              <span>⏱ {course.durationMinutes} minutes</span>
              <span>✅ Pass mark: {course.passMark}%</span>
              <span>🔁 Maximum attempts: 3</span>
            </div>

            {/* WARNING */}
            <div className="flex items-start gap-3 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <p>
                You have a maximum of <strong>3 attempts</strong> to complete
                this assessment. Once attempts are exhausted, the course will
                be locked.
              </p>
            </div>
          </div>

          {/* PDF */}
          {course.pdfUrl && (
            <a
              href={course.pdfUrl}
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 mb-10"
            >
              <FileText className="w-5 h-5" />
              Download Course Material (PDF)
            </a>
          )}

          {/* CTA */}
          <Link
            href={`/courses/${course._id}/test`}
            className="btn btn-primary px-8 py-4 text-lg"
          >
            Start Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}