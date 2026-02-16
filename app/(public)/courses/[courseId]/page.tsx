import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import CourseStatus from "./status";
import StartAssessmentCTA from "./StartAssessmentCTA";

function filenameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last) || "Download material";
  } catch {
    const last = String(url).split("/").filter(Boolean).pop() || "";
    return last || "Download material";
  }
}

export default async function CourseIntroPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  await connectDB();
  const course: any = await Course.findById(courseId).lean();

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found.</p>
      </main>
    );
  }

  // ✅ Combine old single pdfUrl + new materialUrls (dedupe)
  const materialUrls: string[] = Array.from(
    new Set([
      ...(course.pdfUrl ? [String(course.pdfUrl)] : []),
      ...(Array.isArray(course.materialUrls) ? course.materialUrls.map(String) : []),
    ].filter(Boolean))
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      {/* ===== BANNER ===== */}
      <div className="relative h-40 w-full">
        <Image
          src="/course-banner.jpeg"
          alt={course.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* ===== BACK ===== */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-blue-600 mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          {/* ===== TITLE ===== */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            {course.title}
          </h1>

          {/* ===== DESCRIPTION ===== */}
          <p className="text-gray-600 mb-6 text-base sm:text-lg">
            {course.description}
          </p>

          {/* ===== FACILITATOR ===== */}
          {course.facilitator && (
            <p className="text-sm text-gray-500 mb-6">
              <strong>Facilitator:</strong> {course.facilitator}
            </p>
          )}

          {/* ===== STATUS PREVIEW ===== */}
          <CourseStatus courseId={course._id.toString()} />

          {/* ===== INFO CARD ===== */}
          <div className="bg-white rounded-2xl border p-5 sm:p-6 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600 mb-4">
              <span>⏱ {course.durationMinutes} minutes</span>
              <span>✅ Pass mark: {course.passMark}%</span>
              <span>🔁 Maximum attempts: 3</span>
            </div>

            <div className="flex items-start gap-3 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                You have a maximum of <strong>3 attempts</strong>. Once exhausted,
                the course will be locked unless reset by an administrator.
              </p>
            </div>
          </div>

          {/* ===== COURSE MATERIALS (supports multiple) ===== */}
          {materialUrls.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">
                Course Materials
              </h2>

              <div className="space-y-2">
                {materialUrls.map((url, idx) => (
                  <a
                    key={url + idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm break-all"
                  >
                    <FileText className="w-5 h-5" />
                    {filenameFromUrl(url)}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ===== PRIMARY CTA ===== */}
          <div className="flex justify-center sm:justify-start">
            <StartAssessmentCTA courseId={course._id.toString()} />
          </div>
        </div>
      </section>
    </main>
  );
}