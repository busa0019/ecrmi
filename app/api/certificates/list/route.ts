import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Attempt from "@/models/Attempt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const email = searchParams.get("email")?.toLowerCase().trim();
  const name = searchParams.get("name")?.toLowerCase().trim();

  if (!email && !name) return NextResponse.json([]);

  await connectDB();

  // ✅ FIRST: try email (correct + secure)
  let certs = email
    ? await Certificate.find({ participantEmail: email })
        .sort({ issuedAt: -1 })
        .lean()
    : [];

  // ✅ FALLBACK: legacy certificates without email
  if (certs.length === 0 && name) {
    certs = await Certificate.find({
      participantEmail: { $exists: false },
      participantName: new RegExp(`^${name}$`, "i"),
    })
      .sort({ issuedAt: -1 })
      .lean();
  }

  const enriched = await Promise.all(
    certs.map(async (cert) => {
      const attempt = cert.attemptId
        ? await Attempt.findById(cert.attemptId).lean()
        : null;

      return {
        certificateId: cert.certificateId,
        courseTitle: cert.courseTitle,
        participantName: cert.participantName,
        issuedAt: cert.issuedAt,
        score: attempt?.score ?? cert.score ?? null,
      };
    })
  );

  return NextResponse.json(enriched);
}