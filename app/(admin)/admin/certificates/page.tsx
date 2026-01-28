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

  const certificates = await Certificate.find()
    .sort({ createdAt: -1 })
    .lean();

  const courses = await Course.find().lean();
  const courseMap: Record<string, string> = {};
  courses.forEach((c: any) => {
    courseMap[c._id.toString()] = c.title;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">
          Certificates
        </h1>

        <form action="/api/admin/certificates/export" method="GET">
          <button className="btn btn-outline">
            ⬇️ Export CSV
          </button>
        </form>
      </div>

      {/* TABLE */}
      {certificates.length === 0 ? (
        <div className="card text-center text-gray-500">
          No certificates issued yet.
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Course</th>
                <th className="border p-3 text-left">Issued</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c: any) => (
                <tr key={c._id.toString()} className="hover:bg-gray-50">
                  <td className="border p-3 font-medium">
                    {c.participantName || "—"}
                  </td>
                  <td className="border p-3 break-all text-slate-600">
                    {c.participantEmail || "—"}
                  </td>
                  <td className="border p-3">
                    {courseMap[c.courseId?.toString()] || "—"}
                  </td>
                  <td className="border p-3 text-slate-500">
                    {c.createdAt?.toISOString().slice(0, 10)}
                  </td>
                  <td className="border p-3 text-center">
                    <form
                      action="/api/admin/certificates/revoke"
                      method="POST"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={c._id.toString()}
                      />
                      <button className="text-red-600 hover:underline text-sm">
                        Revoke
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}