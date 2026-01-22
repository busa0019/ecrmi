import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { generatePDF } from "@/lib/pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  // ✅ MUST AWAIT PARAMS IN NEXT.JS 16
  const { certificateId } = await params;

  await connectDB();

  const cert = await Certificate.findOne({
    certificateId,
  }).lean();

  if (!cert) {
    return new Response("Certificate not found", {
      status: 404,
    });
  }

  const pdf = await generatePDF(
    cert.participantName,
    cert.courseTitle,
    cert.certificateId
  );

 return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${cert.courseTitle}.pdf"`,
    },
  });
}