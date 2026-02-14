import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import MembershipApplication from "@/models/MembershipApplication";

export async function verifyMembership(rawCertId: string) {
  const certId = decodeURIComponent(String(rawCertId ?? "")).trim();
  if (!certId) return { valid: false as const };

  await connectDB();

  // ✅ NEW: verify from Members first
  const member = await Member.findOne({
    $or: [{ certificateId: certId }, { memberId: certId }],
    status: "active",
  }).lean();

  if (member) {
    return {
      valid: true as const,
      name: member.fullName,
      membershipType: member.membershipType,
      issuedAt:
        member.membershipStartDate ?? member.updatedAt ?? member.createdAt,
      certificateId: member.certificateId ?? member.memberId ?? certId,
      source: "member" as const,
    };
  }

  // ✅ BACKWARD COMPAT: fallback to old approved applications
  const record = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
    isUpdateRequest: { $ne: true },
  }).lean();

  if (!record) return { valid: false as const };

  return {
    valid: true as const,
    name: record.fullName,
    membershipType:
      record.approvedMembershipType ?? record.requestedMembershipType,
    issuedAt: record.reviewedAt ?? record.updatedAt ?? record.createdAt,
    certificateId: record.certificateId,
    source: "application" as const,
  };
}