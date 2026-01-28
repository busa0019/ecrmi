import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  await connectDB();

  const { id } = await context.params;

  const cert = await Certificate.findOne({
    certificateId: id,
  }).lean();

  return Response.json({
    valid: Boolean(cert),
    cert: cert ?? null,
  });
}