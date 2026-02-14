import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";

export async function verifyMembership(rawCertId: string) {
  const certId = decodeURIComponent(String(rawCertId ?? "")).trim();

  if (!certId) return { valid: false as const };

  await connectDB();

  const record = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
    isUpdateRequest: { $ne: true }, // excludes true, allows false OR missing
  }).lean();

  if (!record) return { valid: false as const };

  return {
    valid: true as const,
    name: record.fullName,
    membershipType: record.approvedMembershipType ?? record.requestedMembershipType,
    issuedAt: record.reviewedAt ?? record.updatedAt ?? record.createdAt,
    certificateId: record.certificateId,
  };
}