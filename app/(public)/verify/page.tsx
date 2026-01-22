"use client";

import { useEffect, useState } from "react";
import {
  Award,
  ShieldCheck,
  Download,
  X,
  QrCode,
  Copy,
  User,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { copyText } from "@/components/utils/copyText";

export default function VerifyHub() {
  const [activeTab, setActiveTab] = useState<"my" | "verify">("my");
  const [certs, setCerts] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [activeCert, setActiveCert] = useState<any>(null);

  const router = useRouter();
  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("participantEmail")
      : null;

  useEffect(() => {
    if (!email) return;
    fetch(`/api/certificates/list?email=${email}`)
      .then((res) => res.json())
      .then(setCerts);
  }, [email]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Certificates</h1>
        <p className="text-gray-600 mb-8">
          View, download, and verify your earned certificates.
        </p>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-10">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "my"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600"
            }`}
          >
            My Certificates
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "verify"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600"
            }`}
          >
            Verify Certificate
          </button>
        </div>

        {/* ✅ MY CERTIFICATES (UNCHANGED) */}
        {activeTab === "my" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {certs.map((cert) => (
              <div
                key={cert.certificateId}
                className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {cert.certificateId}
                  </span>
                </div>

                <h2 className="text-lg font-semibold mb-4 leading-snug">
                  {cert.courseTitle}
                </h2>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {cert.participantName}
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Issued:{" "}
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </div>

                  {typeof cert.score === "number" && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Score: {cert.score}%
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveCert(cert)}
                    className="btn btn-outline w-full"
                  >
                    View
                  </button>

                  <a
                    href={`/api/certificates/${cert.certificateId}`}
                    className="btn btn-outline"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ VERIFY TAB (STYLED, LOGIC UNCHANGED) */}
        {activeTab === "verify" && (
          <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-3xl mx-auto">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold mb-2">
              Verify Certificate
            </h2>

            {/* Supporting text */}
            <p className="text-gray-600 mb-8 max-w-xl">
              Enter the verification code or scan the QR code on the certificate to confirm that this credential was
              issued by the Emergency, Crisis & Disaster Risk
              Management Institute (ECRMI).
            </p>

            {/* Input */}
            <label className="block text-sm font-semibold mb-2">
              Verification Code
            </label>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. HS-2026-JD-85-A7B9C2"
                className="input flex-1 h-12"
              />

              <button
                className="btn btn-primary h-12 px-8 whitespace-nowrap"
                onClick={() => {
                  if (!code.trim()) return;
                  router.push(`/verify/${code.trim()}`);
                }}
              >
                Verify
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ MODAL (UNCHANGED, WORKING) */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveCert(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-2 mt-2">
              Certificate Preview
            </h2>
            <p className="text-gray-600 mb-6">
              This is a preview of the certificate. You can download it
              from here.
            </p>

            <iframe
              src={`/api/certificates/${activeCert.certificateId}`}
              className="w-full h-[500px] border rounded-lg mb-6"
            />

            <div className="border rounded-2xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <QrCode className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold">
                    Verification Code
                  </p>
                  <input
                    readOnly
                    value={activeCert.certificateId}
                    className="mt-1 font-mono text-sm bg-gray-50 border rounded px-3 py-2 w-[280px]"
                  />
                </div>
              </div>

             <button
  onClick={() => copyText(activeCert.certificateId)}
  className="btn btn-outline"
>
  <Copy className="w-4 h-4" />
</button>
            </div>

            <div className="flex justify-end pb-2">
              <a
                href={`/api/certificates/${activeCert.certificateId}`}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}