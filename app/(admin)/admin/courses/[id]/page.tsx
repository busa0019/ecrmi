export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Question from "@/models/Question";
import QuestionForm from "@/components/admin/QuestionForm";
import QuestionList from "@/components/admin/QuestionList";
import Link from "next/link";

export default async function ManageQuestions({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ VERY IMPORTANT: stop "new" from hitting MongoDB
  if (id === "new") {
    redirect("/admin/courses/new");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  await connectDB();

  const courseRaw = await Course.findById(id).lean();
  if (!courseRaw) {
    return <p>Course not found</p>;
  }

  const questionsRaw = await Question.find({
    courseId: id,
  }).lean();

  const course = {
    _id: courseRaw._id.toString(),
    title: courseRaw.title,
  };

  const questions = questionsRaw.map((q: any) => ({
    _id: q._id.toString(),
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {course.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage questions for this course
          </p>
        </div>

        <Link
          href="/admin/courses"
          className="text-sm text-teal-600 underline inline-flex items-center justify-end hover:text-teal-700 transition-colors"
        >
          ← Back to Courses
        </Link>
      </div>

      <QuestionList questions={questions} />
      <QuestionForm courseId={course._id} />
    </div>
  );
}