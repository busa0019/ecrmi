export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

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

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app || app.status !== "approved") {
    return NextResponse.json(
      { error: "Application not approved" },
      { status: 400 }
    );
  }

  // ✅ Generate certificate ID
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const certId = `ECRMI-MEM-${random4}`;

  const issuedAt = new Date();

  // ✅ Save only required fields
  app.certificateId = certId;
  app.reviewedAt = issuedAt;

  await app.save();

  return NextResponse.json({
    success: true,
    certificateId: certId,
    issuedAt: formatDateWithOrdinal(issuedAt),
  });
}