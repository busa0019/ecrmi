"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Download,
  X,
  Copy,
  User,
  Calendar,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { copyText } from "@/components/utils/copyText";
import QRCode from "qrcode";
import Image from "next/image";

export default function VerifyHub() {
  const [activeTab, setActiveTab] = useState<"my" | "verify">("my");
  const [certs, setCerts] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [activeCert, setActiveCert] = useState<any>(null);
  const [qrData, setQrData] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("participantEmail")
      : null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  /* ================= LOAD CERTIFICATES ================= */
  useEffect(() => {
    if (!email) return;
    fetch(`/api/certificates/list?email=${email}`)
      .then((res) => res.json())
      .then((data) => setCerts(Array.isArray(data) ? data : []));
  }, [email]);

  /* ================= GENERATE QR ================= */
  useEffect(() => {
    if (!baseUrl) return;
    QRCode.toDataURL(`${baseUrl}/verify`, { width: 180 }).then(setQrData);
  }, [baseUrl]);

  function handleCopy(value: string) {
    copyText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Certificates & Verification
        </h1>
        <p className="text-gray-600 mb-8 max-w-3xl">
          View, download, and verify certificates issued by the Emergency,
          Crisis & Disaster Risk Management Institute (ECRMI).
        </p>

        {/* TABS */}
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

        {/* ================= MY CERTIFICATES ================= */}
        {activeTab === "my" && (
          <>
            {certs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border">
                <Award className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No certificates yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Certificates will appear here once you successfully complete
                  a course and pass the assessment.
                </p>
              </div>
            ) : (
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
          </>
        )}

        {/* ================= VERIFY CERTIFICATE ================= */}
        {activeTab === "verify" && (
          <div className="bg-white rounded-2xl border shadow-sm p-8 sm:p-10 max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Verify Certificate
            </h2>

            <p className="text-gray-600 mb-8 max-w-xl">
              Enter the certificate verification code printed on the
              certificate (e.g. <strong>ECRMI-26-RAO-A9F3</strong>) or
              scan the QR code below.
            </p>

            <label className="block text-sm font-semibold mb-2">
              Certificate Verification Code
            </label>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase())
                }
                placeholder="ECRMI-26-RAO-A9F3"
                className="input flex-1 h-12"
              />

              <button
                className="btn btn-primary h-12 px-8"
                onClick={() => {
                  if (!code.trim()) return;
                  router.push(
                    `/verify/${code.trim().toUpperCase()}`
                  );
                }}
              >
                Verify
              </button>
            </div>

            {qrData && (
              <div className="border-t pt-8 text-center">
                <p className="text-sm font-medium mb-4">
                  Or scan this QR code
                </p>
                <Image
                  src={qrData}
                  alt="Verification QR"
                  width={180}
                  height={180}
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 sm:px-6">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
          >
            {copied && (
              <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded text-sm">
                Copied!
              </div>
            )}

            <button
              onClick={() => setActiveCert(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              Certificate Preview
            </h2>

            <iframe
              src={`/api/certificates/${activeCert.certificateId}`}
              className="w-full h-[500px] border rounded-lg mb-6"
            />

            <div className="border rounded-2xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold">
                      Certificate Verification Code
                    </p>
                    <input
                      readOnly
                      value={activeCert.certificateId}
                      className="mt-1 font-mono text-sm bg-gray-50 border rounded px-3 py-2 w-full sm:w-[280px]"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleCopy(activeCert.certificateId)
                  }
                  className="btn btn-outline w-full sm:w-auto"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </button>
              </div>
            </div>

            <div className="flex justify-end">
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