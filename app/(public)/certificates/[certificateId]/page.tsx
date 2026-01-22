export default async function CertificatePreview({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Certificate Preview
        </h1>
        <p className="text-gray-600 mb-8">
          This is a preview of the certificate. You can download it
          from here.
        </p>

        <div className="border rounded-xl overflow-hidden shadow mb-6 bg-white">
          <iframe
            src={`/api/certificates/${certificateId}`}
            className="w-full h-[600px]"
          />
        </div>

        <a
          href={`/api/certificates/${certificateId}`}
          className="btn btn-primary"
        >
          Download PDF
        </a>
      </div>
    </main>
  );
}