import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import CourseGrid from "@/components/CourseGrid";

export default async function CoursesPage() {
  await connectDB();

  const coursesFromDb = await Course.find({ active: true }).lean();

  // ✅ CONVERT TO PLAIN OBJECTS (VERY IMPORTANT)
  const courses = coursesFromDb.map((course: any) => ({
    _id: course._id.toString(), // ✅ stringify ObjectId
    title: course.title,
    description: course.description,
    facilitator: course.facilitator,
    durationMinutes: course.durationMinutes,
    passMark: course.passMark,
    pdfUrl: course.pdfUrl,
  }));

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-b
        from-slate-100
        via-slate-50
        to-white
      "
    >
      {/* HEADER */}
      <section className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Available Training Programs
          </h1>
          <p className="text-gray-600 max-w-3xl text-lg">
            Review course materials and complete assessments to earn your
            QR‑verified professional certificates.
          </p>
        </div>
      </section>

      {/* COURSES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <CourseGrid courses={courses} />
        </div>
      </section>
    </main>
  );
}