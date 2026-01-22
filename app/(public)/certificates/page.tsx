"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  User,
  Calendar,
  CheckCircle,
  Download,
} from "lucide-react";

type Certificate = {
  certificateId: string;
  courseTitle: string;
  participantName: string;
  issuedAt: string;
  score?: number;
};

export default function MyCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem("participantEmail");
    const name = sessionStorage.getItem("participantName");

    if (!email && !name) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (name) params.append("name", name);

    fetch(`/api/certificates/list?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
        <p className="text-gray-600 mb-10">
          View and download your earned certificates
        </p>

        {loading && <p className="text-gray-500">Loading…</p>}

        {!loading && certs.length === 0 && (
          <p className="text-gray-500">
            You have not earned any certificates yet.
          </p>
        )}

        {!loading && certs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {certs.map((cert) => (
              <div
                key={cert.certificateId}
                className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {cert.certificateId}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold mb-4 leading-snug">
                  {cert.courseTitle}
                </h2>

                {/* Meta */}
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

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/certificates/${cert.certificateId}`}
                    className="btn btn-outline w-full"
                  >
                    View
                  </Link>

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
      </div>
    </main>
  );
}