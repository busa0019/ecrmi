"use client";

import { useParams } from "next/navigation";

export default function CertificatePreview() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Certificate Preview
        </h1>

        <div className="border rounded-xl overflow-hidden bg-white">
          <iframe
            src={`/api/certificates/${certificateId}`}
            className="w-full h-[700px]"
          />
        </div>

        <div className="mt-6">
          <a
            href={`/api/certificates/${certificateId}`}
            className="btn btn-primary"
          >
            Download PDF
          </a>
        </div>
      </div>
    </main>
  );
}