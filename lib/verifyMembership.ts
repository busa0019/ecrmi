import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";

export async function verifyMembership(certId: string) {
  await connectDB();

  const record = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
  }).lean();

  if (!record) {
    return { valid: false as const };
  }

  return {
    valid: true as const,
    name: record.fullName,
    membershipType: record.approvedMembershipType,
    issuedAt: record.reviewedAt ?? record.updatedAt ?? record.createdAt,
  };
}