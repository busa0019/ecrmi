import "dotenv/config";
import mongoose from "mongoose";
import MembershipApplication from "../models/MembershipApplication";
import Member from "../models/Member";

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(MONGODB_URI);

  const approvedApps = await MembershipApplication.find({
    status: "approved",
    isUpdateRequest: { $ne: true },
    certificateId: { $exists: true, $ne: "" },
  }).lean();

  let created = 0;
  let skipped = 0;

  for (const app of approvedApps) {
    // avoid duplicates by certificateId
    const exists = await Member.findOne({ certificateId: app.certificateId }).lean();
    if (exists) {
      skipped++;
      continue;
    }

    await Member.create({
      applicationId: app.applicationId,
      sourceApplicationObjectId: app._id,
      fullName: app.fullName,
      email: app.email,
      membershipType: app.approvedMembershipType ?? app.requestedMembershipType ?? "Member",
      jobTitle: app.jobTitle ?? "",
      organization: app.organization ?? "",
      cvUrl: app.cvUrl ?? "",
      certificatesUrl: app.certificatesUrl ?? [],
      paymentReceiptUrl: app.paymentReceiptUrl ?? "",
      certificateId: app.certificateId,
      certificateUrl: app.certificateUrl ?? "",
      letterUrl: app.letterUrl ?? "",
      issuedAt: app.reviewedAt ?? app.updatedAt ?? app.createdAt,
      status: "active",
    });

    created++;
  }

  console.log({ total: approvedApps.length, created, skipped });
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});