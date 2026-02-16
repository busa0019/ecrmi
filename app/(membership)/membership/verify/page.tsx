"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MembershipVerifyHome() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleVerify = () => {
    if (!code) return;
    router.push(`/membership/verify/${code.trim()}`);
  };

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

        <h1 className="text-3xl font-bold mb-4">
          Verify Membership Certificate
        </h1>

        <p className="text-gray-600 mb-6">
          Enter the membership number printed on the certificate.
        </p>

        <div className="flex gap-4 justify-center">
          <input
            type="text"
            placeholder="ECRMI-A-1234"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border rounded-lg px-4 py-3 w-full max-w-md"
          />

          <button
            onClick={handleVerify}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Verify
          </button>
        </div>

      </div>
    </main>
  );
}