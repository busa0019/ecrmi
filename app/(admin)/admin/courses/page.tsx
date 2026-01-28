import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Link from "next/link";
import CourseCard from "@/components/admin/CourseCard";

export default async function CoursesAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  await connectDB();

  const coursesRaw = await Course.find().lean();

  // ✅ SERIALIZE FOR CLIENT COMPONENTS (UNCHANGED)
  const courses = coursesRaw.map((c: any) => ({
    _id: c._id.toString(),
    title: c.title,
    description: c.description,
    durationMinutes: c.durationMinutes,
    passMark: c.passMark,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Course Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create and manage your training courses
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium"
        >
          Create New Course
        </Link>
      </div>

      {/* COURSES GRID */}
      {courses.length === 0 ? (
        <div className="card text-center text-gray-500 border border-dashed rounded-xl py-16 px-6 bg-white/60">
          No courses created yet.
        </div>
      ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
            />
          ))}
        </div>
      )}
    </div>
  );
}