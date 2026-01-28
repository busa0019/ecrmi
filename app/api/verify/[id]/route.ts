import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  await connectDB();

  const code = context.params.id.toUpperCase().trim();

  const cert = await Certificate.findOne({
    certificateId: code,
  }).lean();

  if (!cert) {
    return new Response(
      JSON.stringify({ valid: false }),
      { status: 200 }
    );
  }

  return new Response(
    JSON.stringify({
      valid: true,
      cert,
    }),
    { status: 200 }
  );
}