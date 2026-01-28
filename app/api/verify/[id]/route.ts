import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(_: Request, { params }: any) {
  await connectDB();

  const cert = await Certificate.findOne({
    certificateId: params.id,
  }).lean();

  if (!cert) return Response.json({ valid: false });

  return Response.json({ valid: true, cert });
}