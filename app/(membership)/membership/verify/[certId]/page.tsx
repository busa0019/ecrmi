import Image from "next/image";
import { verifyMembership } from "@/lib/verifyMembership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeCertId(input: string) {
  // decode + trim + remove invisible characters that often come from QR/Copy-Paste
  return decodeURIComponent(String(input ?? ""))
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export default async function VerifyMembershipPage({
  params,
}: {
  params: { certId: string } | Promise<{ certId: string }>;
}) {
  const { certId: rawCertId } = await Promise.resolve(params);

  const certId = normalizeCertId(rawCertId);

  const data = await verifyMembership(certId);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full text-center">
        <Image
          src="/ecrmi-logo.jpeg"
          alt="ECRMI Logo"
          width={120}
          height={120}
          className="mx-auto mb-6"
        />

        {data.valid ? (
          <>
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 animate-pulse">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-green-700">
              Membership Verified
            </h1>

            <div className="bg-gray-100 rounded-xl p-6 text-left space-y-2">
              <p><strong>Member Name:</strong> {data.name}</p>
              <p><strong>Membership Type:</strong> {data.membershipType}</p>
              <p>
                <strong>Date Issued:</strong>{" "}
                {data.issuedAt ? new Date(data.issuedAt).toDateString() : "—"}
              </p>
              <p><strong>Verification Code:</strong> {certId}</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4 text-red-600">
              Invalid Certificate
            </h1>
            <p className="text-gray-600">
              This membership certificate could not be verified.
            </p>

            {/* TEMP DEBUG (remove after confirmed) */}
            <div className="mt-4 text-xs text-gray-400 text-left bg-gray-50 p-3 rounded">
              <div><strong>Debug raw certId:</strong> {String(rawCertId)}</div>
              <div><strong>Debug normalized certId:</strong> {String(certId)}</div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}