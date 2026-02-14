export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import Member from "@/models/Member";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

/* ===== helper: generate unique certificate id ===== */
async function generateUniqueCertificateId() {
  // try a few times to avoid collisions
  for (let i = 0; i < 10; i++) {
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const certId = `ECRMI-MEM-${random4}`;

    const existsInApps = await MembershipApplication.exists({
      certificateId: certId,
    });

    const existsInMembers = await Member.exists({
      certificateId: certId,
    });

    if (!existsInApps && !existsInMembers) return certId;
  }

  // fallback (very unlikely)
  return `ECRMI-MEM-${Date.now()}`;
}

/* ===== GET SINGLE APPLICATION ===== */
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(app);
}

/* ===== APPROVE / REJECT ===== */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { status, approvedMembershipType, adminNotes } = await req.json();

  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // normalize approved type
  const finalApprovedType =
    approvedMembershipType ||
    app.approvedMembershipType ||
    app.requestedMembershipType ||
    "";

  // ✅ Update application record
  app.status = status;
  app.approvedMembershipType = finalApprovedType;
  app.adminNotes = adminNotes ?? app.adminNotes ?? "";
  app.reviewedAt = new Date();

  // ✅ If approved:
  // - for NEW application: ensure certificateId exists
  // - for UPDATE request: do NOT generate a new certificateId
  if (status === "approved") {
    if (!app.isUpdateRequest) {
      if (!app.certificateId || String(app.certificateId).trim() === "") {
        app.certificateId = await generateUniqueCertificateId();
      }
    }
  }

  await app.save();

  // ✅ If approved → move/update into Members collection
  if (status === "approved") {
    // Update requests should update an existing member (same email)
    const existingMember = await Member.findOne({ email: app.email }).lean();

    // If this is an update request but member doesn't exist, we can either:
    // - create a new member (not ideal), or
    // - return error. We'll be safe and allow creation using existing app.certificateId if present.
    const certificateIdToUse =
      existingMember?.certificateId ||
      app.certificateId ||
      (app.isUpdateRequest ? "" : await generateUniqueCertificateId());

    const memberUpdate: any = {
      fullName: app.fullName ?? "",
      email: app.email ?? "",
      membershipType: finalApprovedType,

      jobTitle: app.jobTitle ?? "",
      organization: app.organization ?? "",
      natureOfWork: app.natureOfWork ?? "",
      yearsOfExperience: Number(app.yearsOfExperience ?? 0),

      cvUrl: app.cvUrl ?? "",
      certificatesUrl: app.certificatesUrl ?? [],
      paymentReceiptUrl: app.paymentReceiptUrl ?? "",

      // Do not wipe existing generated files if update request doesn't include them
      certificateUrl: app.certificateUrl ?? existingMember?.certificateUrl ?? "",
      letterUrl: app.letterUrl ?? existingMember?.letterUrl ?? "",

      membershipStartDate:
        existingMember?.membershipStartDate ??
        app.reviewedAt ??
        app.updatedAt ??
        app.createdAt,

      status: "active",
      applicationId: app.applicationId ?? existingMember?.applicationId ?? "",
      sourceApplicationObjectId: app._id,
    };

    // Only set certificateId/memberId when we actually have one
    if (certificateIdToUse) {
      memberUpdate.certificateId = certificateIdToUse;
      memberUpdate.memberId = certificateIdToUse;
    }

    await Member.findOneAndUpdate(
      { email: app.email },
      { $set: memberUpdate },
      { upsert: true, new: true }
    );
  }

  return NextResponse.json({ success: true });
}