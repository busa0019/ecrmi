import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";

export async function verifyMembership(rawCertId: string) {
  // normalize + protect against undefined/empty
  const certId = decodeURIComponent(rawCertId ?? "").trim();

  if (!certId) {
    return { valid: false as const };
  }

  await connectDB();

  const record = await MembershipApplication.findOne({
    certificateId: certId,       // ✅ must match the URL certId
    status: "approved",
    isUpdateRequest: false,      // ✅ avoid update-request records
  }).lean();

  if (!record) {
    return { valid: false as const };
  }

  return {
    valid: true as const,
    name: record.fullName,
    membershipType:
      record.approvedMembershipType ?? record.requestedMembershipType,
    issuedAt: record.reviewedAt ?? record.updatedAt ?? record.createdAt,
    certificateId: record.certificateId,
  };
}