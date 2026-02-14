import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import Member from "@/models/Member";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function POST() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const approvedApps = await MembershipApplication.find({
      status: "approved",
      isUpdateRequest: { $ne: true },
      certificateId: { $exists: true, $ne: "" },
    }).lean();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const app of approvedApps) {
      const certId = String(app.certificateId || "").trim();
      const fullName = String(app.fullName || "").trim();
      const email = String(app.email || "").trim();
      const membershipType = String(
        app.approvedMembershipType || app.requestedMembershipType || ""
      ).trim();

      if (!certId || !fullName || !email || !membershipType) {
        skipped++;
        continue;
      }

      const payload: any = {
        // identity
        fullName,
        email,
        membershipType,

        // keep your existing fields
        jobTitle: app.jobTitle ?? "",
        organization: app.organization ?? "",
        natureOfWork: app.natureOfWork ?? "",
        yearsOfExperience: Number(app.yearsOfExperience ?? 0),

        cvUrl: app.cvUrl ?? "",
        certificatesUrl: app.certificatesUrl ?? [],
        paymentReceiptUrl: app.paymentReceiptUrl ?? "",

        certificateUrl: app.certificateUrl ?? "",
        letterUrl: app.letterUrl ?? "",

        membershipStartDate: app.reviewedAt ?? app.updatedAt ?? app.createdAt,

        // IMPORTANT: these enable verification from Members
        certificateId: certId,
        memberId: certId,

        // helpful references
        applicationId: app.applicationId ?? "",
        sourceApplicationObjectId: app._id,
        status: "active",
      };

      const existing = await Member.findOne({ certificateId: certId }).lean();

      if (existing) {
        await Member.updateOne({ certificateId: certId }, { $set: payload });
        updated++;
      } else {
        await Member.create(payload);
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      totalApprovedApps: approvedApps.length,
      created,
      updated,
      skipped,
    });
  } catch (err) {
    console.error("migrate-to-members error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}