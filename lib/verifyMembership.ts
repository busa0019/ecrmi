import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import MembershipApplication from "@/models/MembershipApplication";

export async function verifyMembership(rawCertId: string) {
  const certId = decodeURIComponent(String(rawCertId ?? ""))
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

  if (!certId) return { valid: false as const };

  await connectDB();

  // 1) ✅ Verify CURRENT member certificateId/memberId first
  const memberCurrent = await Member.findOne({
    $or: [{ certificateId: certId }, { memberId: certId }],
    status: "active",
  }).lean();

  if (memberCurrent) {
    const issuedAt =
      memberCurrent.membershipStartDate ??
      memberCurrent.updatedAt ??
      memberCurrent.createdAt;

    return {
      valid: true as const,
      name: memberCurrent.fullName,
      verifiedCertificateId: certId,

      // issued-as == current when certId is current
      issuedAsMembershipType: memberCurrent.membershipType,
      currentMembershipType: memberCurrent.membershipType,

      issuedAt,
      currentCertificateId: memberCurrent.certificateId ?? memberCurrent.memberId ?? certId,
      status: memberCurrent.status,
      source: "member_current" as const,
    };
  }

  // 2) ✅ Verify OLD certificates stored in certificateHistory
  const memberHistory = await Member.findOne({
    status: "active",
    "certificateHistory.certificateId": certId,
  }).lean();

  if (memberHistory) {
    const historyArr = Array.isArray(memberHistory.certificateHistory)
      ? memberHistory.certificateHistory
      : [];

    const matched = historyArr.find(
      (h: any) => String(h?.certificateId ?? "").trim().toLowerCase() === certId.toLowerCase()
    );

    const issuedAt =
      matched?.issuedAt ??
      memberHistory.membershipStartDate ??
      memberHistory.updatedAt ??
      memberHistory.createdAt;

    return {
      valid: true as const,
      name: memberHistory.fullName,
      verifiedCertificateId: certId,

      issuedAsMembershipType: matched?.membershipType ?? memberHistory.membershipType,
      currentMembershipType: memberHistory.membershipType,

      issuedAt,
      currentCertificateId:
        memberHistory.certificateId ?? memberHistory.memberId ?? "",
      status: memberHistory.status,
      source: "member_history" as const,
    };
  }

  // 3) ✅ Backward compat: fallback to old approved applications
  const record = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
    isUpdateRequest: { $ne: true },
  }).lean();

  if (!record) return { valid: false as const };

  return {
    valid: true as const,
    name: record.fullName,
    verifiedCertificateId: certId,

    // For old application records, issued-as == current (we don't track history there)
    issuedAsMembershipType:
      record.approvedMembershipType ?? record.requestedMembershipType,
    currentMembershipType:
      record.approvedMembershipType ?? record.requestedMembershipType,

    issuedAt: record.reviewedAt ?? record.updatedAt ?? record.createdAt,
    currentCertificateId: record.certificateId,
    status: "active",
    source: "application" as const,
  };
}