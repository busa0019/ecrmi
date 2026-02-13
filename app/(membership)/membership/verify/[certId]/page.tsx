import Image from "next/image";

export default async function VerifyMembershipPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/membership/verify/${certId}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full text-center">

        {/* ✅ LOGO */}
        <Image
          src="/ecrmi-logo.jpeg"
          alt="ECRMI Logo"
          width={120}
          height={120}
          className="mx-auto mb-6"
        />

        {data.valid ? (
          <>
            {/* ✅ Animated Check */}
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 animate-pulse">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-green-700">
              Membership Verified
            </h1>

            <p className="text-gray-600 mb-6">
              This membership certificate is authentic and officially issued
              by the Emergency, Crisis & Disaster Risk Management Institute (ECRMI).
            </p>

            <div className="bg-gray-100 rounded-xl p-6 text-left space-y-2">
              <p><strong>Member Name:</strong> {data.name}</p>
              <p><strong>Membership Type:</strong> {data.membershipType}</p>
              <p>
                <strong>Date Issued:</strong>{" "}
                {new Date(data.issuedAt).toDateString()}
              </p>
              <p><strong>Verification Code:</strong> {certId}</p>
            </div>

            <div className="mt-6 text-green-600 font-medium">
              ✔ Verified against ECRMI official records
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-4xl text-red-600">✖</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-red-600">
              Invalid Certificate
            </h1>

            <p className="text-gray-600">
              This membership certificate could not be verified.
            </p>
          </>
        )}
      </div>
    </main>
  );
}