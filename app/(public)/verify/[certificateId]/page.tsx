import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Image from "next/image";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";

export default async function VerifyCertificate({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;

  await connectDB();

  const cert = await Certificate.findOne({
    certificateId,
  }).lean();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 max-w-xl w-full text-center">
        {/* ===== ISSUER ===== */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/ecrmi-logo.jpeg"
            alt="Emergency, Crisis & Disaster Risk Management Institute"
            width={64}
            height={64}
            priority
          />
          <p className="mt-2 text-xs text-gray-500 uppercase tracking-wide">
            Official Certificate Verification
          </p>
        </div>

        {cert ? (
          <>
            {/* ===== VERIFIED ===== */}
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Certificate Verified
            </h1>

            <p className="text-gray-600 mb-8">
              This certificate is authentic and was officially issued by the
              Emergency, Crisis & Disaster Risk Management Institute (ECRMI).
            </p>

            {/* ===== DETAILS ===== */}
            <div className="bg-slate-50 rounded-xl border p-6 text-left text-sm space-y-3">
              <p>
                <strong>Participant Name:</strong>{" "}
                {cert.participantName}
              </p>
              <p>
                <strong>Course Title:</strong>{" "}
                {cert.courseTitle}
              </p>
              <p>
                <strong>Date Issued:</strong>{" "}
                {new Date(cert.issuedAt).toDateString()}
              </p>
              <p>
                <strong>Verification Code:</strong>{" "}
                <span className="font-mono">
                  {cert.certificateId}
                </span>
              </p>
            </div>

            {/* ===== TRUST FOOTER ===== */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified against ECRMI official records
            </div>
          </>
        ) : (
          <>
            {/* ===== NOT FOUND ===== */}
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Certificate Not Found
            </h1>

            <p className="text-gray-600 mb-6">
              The verification code provided does not match any certificate
              issued by ECRMI.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              Please confirm the code and try again, or contact the issuing
              institution for assistance.
            </div>
          </>
        )}
      </div>
    </main>
  );
}