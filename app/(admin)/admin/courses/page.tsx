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

  // ✅ SERIALIZE FOR CLIENT COMPONENTS
  const courses = coursesRaw.map((c: any) => ({
    _id: c._id.toString(),
    title: c.title,
    description: c.description,
    durationMinutes: c.durationMinutes,
    passMark: c.passMark,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Course Management
          </h1>
          <p className="text-gray-600">
            Create and manage your training courses
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg"
        >
          Create New Course
        </Link>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
          />
        ))}
      </div>
    </div>
  );
}