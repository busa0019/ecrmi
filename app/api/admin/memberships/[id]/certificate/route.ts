export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

/* ================= DATE FORMAT ================= */
function formatDateWithOrdinal(date: Date) {
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });

  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${month} ${day}${ordinal}, ${year}`;
}

/* ================= MEMBERSHIP CODE ================= */
function getMembershipCode(membershipType: string) {
  const t = String(membershipType || "").toLowerCase();

  // more specific first
  if (t.includes("professional") && t.includes("fellow")) return "PF";
  if (t.includes("honorary")) return "H";
  if (t.includes("affiliate")) return "AF"; // avoids clash with Associate
  if (t.includes("associate")) return "A";
  if (t.includes("technical")) return "T";
  if (t.includes("graduate")) return "G";
  if (t.includes("fellow")) return "F";
  if (t.includes("professional")) return "P";

  return "M";
}

async function generateUniqueCertificateId(membershipType: string) {
  const code = getMembershipCode(membershipType);

  while (true) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const certId = `ECRMI-${code}-${rand}`;

    const exists = await MembershipApplication.exists({ certificateId: certId });
    if (!exists) return certId;
  }
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ protect
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app || app.status !== "approved") {
    return NextResponse.json(
      { error: "Application not approved" },
      { status: 400 }
    );
  }

  // ✅ If already issued, don’t regenerate (keeps QR/links stable)
  if (app.certificateId) {
    const issuedAtExisting =
      app.reviewedAt ?? app.updatedAt ?? app.createdAt ?? new Date();

    return NextResponse.json({
      success: true,
      certificateId: app.certificateId,
      issuedAt: formatDateWithOrdinal(new Date(issuedAtExisting)),
      note: "Certificate ID already exists (not regenerated).",
    });
  }

  const membershipType =
    app.approvedMembershipType ?? app.requestedMembershipType ?? "";

  const certId = await generateUniqueCertificateId(membershipType);
  const issuedAt = new Date();

  app.certificateId = certId;
  app.reviewedAt = issuedAt;

  await app.save();

  return NextResponse.json({
    success: true,
    certificateId: certId,
    issuedAt: formatDateWithOrdinal(issuedAt),
  });
}