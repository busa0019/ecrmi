"use client";

import { useState } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function MembershipStatusPage() {
  const [lookup, setLookup] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  async function checkStatus() {
    setError("");
    setData(null);

    const res = await fetch(
      `/api/membership/status?lookup=${lookup}`
    );

    const json = await res.json();

    if (!json.success) {
      setError("No membership record found.");
      return;
    }

    setData(json);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex justify-center px-4 py-12">
      <div className="bg-white border rounded-xl p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-xl font-bold">
          Membership Status
        </h1>

        <input
          className="input w-full"
          placeholder="Email or Membership ID"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
        />

        <button
          onClick={checkStatus}
          className="btn btn-primary w-full"
        >
          Check Status
        </button>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {data && (
          <>
            {data.status === "pending" && (
              <>
                <Clock className="w-10 h-10 text-yellow-500 mx-auto" />
                <p className="font-semibold">
                  Application Pending
                </p>
                <p className="text-sm text-gray-600">
                  Please check back in 24–48 hours.
                </p>
              </>
            )}

            {data.status === "approved" && (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <p className="font-semibold text-lg">
                  Membership Approved
                </p>

                <p className="text-sm text-gray-600">
                  {data.fullName}
                </p>

                <p className="text-sm text-gray-600">
                  {data.membershipType}
                </p>

                {data.certificateUrl && (
                  <a
                    href={data.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary w-full"
                  >
                    Download Membership Certificate
                  </a>
                )}

                {data.letterUrl && (
                  <a
                    href={data.letterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline w-full"
                  >
                    Download Membership Letter
                  </a>
                )}
              </>
            )}

            {data.status === "rejected" && (
              <>
                <XCircle className="w-10 h-10 text-red-600 mx-auto" />
                <p className="font-semibold">
                  Application Rejected
                </p>
                <p className="text-sm text-gray-600">
                  Please contact ECRMI for further information.
                </p>
              </>
            )}
          </>
        )}

        <p className="text-sm text-gray-600">
  Existing member?{" "}
  <a href="/membership/update" className="text-blue-600 underline">
    Update your membership here
  </a>
</p>
      </div>

      
    </main>
  );
}