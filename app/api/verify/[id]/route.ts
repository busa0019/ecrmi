import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const code = params.id.toUpperCase().trim();

  const cert = await Certificate.findOne({
    certificateId: code,
  }).lean();

  if (!cert) {
    return Response.json({ valid: false });
  }

  return Response.json({
    valid: true,
    cert,
  });
}