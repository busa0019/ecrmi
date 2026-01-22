import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { CheckCircle, XCircle } from "lucide-react";

export default async function VerifyCertificate({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  // ✅ REQUIRED IN NEXT.JS 16
  const { certificateId } = await params;

  await connectDB();

  const cert = await Certificate.findOne({
    certificateId,
  }).lean();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-xl w-full">
        {cert ? (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />

            <h1 className="text-3xl font-bold text-center mb-2">
              Certificate Verified
            </h1>

            <p className="text-gray-600 text-center mb-8">
              This certificate is valid and issued by ECRMI.
            </p>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Name:</strong> {cert.participantName}
              </p>
              <p>
                <strong>Course:</strong> {cert.courseTitle}
              </p>
              <p>
                <strong>Issued:</strong>{" "}
                {new Date(cert.issuedAt).toDateString()}
              </p>
              <p>
                <strong>Verification Code:</strong>{" "}
                {cert.certificateId}
              </p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-center mb-2">
              Certificate Not Found
            </h1>
            <p className="text-gray-600 text-center">
              The verification code provided is invalid.
            </p>
          </>
        )}
      </div>
    </main>
  );
}