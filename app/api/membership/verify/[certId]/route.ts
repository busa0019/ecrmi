import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  await connectDB();

  const { certId } = await params;  // ✅ unwrap properly

  const record = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
  });

  if (!record) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    name: record.fullName,
    membershipType: record.approvedMembershipType,
    issuedAt: record.reviewedAt,
  });
}