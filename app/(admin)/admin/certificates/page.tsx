export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Course from "@/models/Course";

export default async function CertificatesAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  await connectDB();

  const certificates = await Certificate.find().lean();
  const courses = await Course.find().lean();

  const courseMap: Record<string, string> = {};
  courses.forEach((c: any) => {
    courseMap[c._id.toString()] = c.title;
  });

  return (
    <main className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Certificates
        </h1>

        {/* CSV Export */}
        <form
          action="/api/admin/certificates/export"
          method="GET"
        >
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            ⬇️ Export CSV
          </button>
        </form>
      </div>

      {/* Table */}
      <table className="w-full border bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Course</th>
            <th className="border p-2 text-left">Issued</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certificates.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-6 text-center text-gray-500"
              >
                No certificates issued yet.
              </td>
            </tr>
          ) : (
            certificates.map((c: any) => (
              <tr key={c._id.toString()}>
                <td className="border p-2">
                  {c.participantName || "—"}
                </td>
                <td className="border p-2">
                  {c.participantEmail || "—"}
                </td>
                <td className="border p-2">
                  {c.courseId
                    ? courseMap[c.courseId.toString()] ||
                      "Unknown course"
                    : "—"}
                </td>
                <td className="border p-2">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border p-2 text-center">
                  {/* ✅ REVOKE (NO onSubmit, NO JS) */}
                  <form
                    action="/api/admin/certificates/revoke"
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={c._id.toString()}
                    />
                    <button className="text-red-600 text-sm hover:underline">
                      Revoke
                    </button>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}