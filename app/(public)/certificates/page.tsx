"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

export default function MyCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    const email = sessionStorage.getItem("participantEmail");
    if (!email) return;

    fetch(`/api/certificates/list?email=${email}`)
      .then((res) => res.json())
      .then((data) => setCerts(data || []));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          My Certificates
        </h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {certs.map((cert) => (
            <div
              key={cert.certificateId}
              className="bg-white rounded-2xl border p-6"
            >
              <h2 className="font-semibold mb-4">
                {cert.courseTitle}
              </h2>

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
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}