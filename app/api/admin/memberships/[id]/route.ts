export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import Member from "@/models/Member";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

/* ===== helper: membership code from membership type ===== */
function getMembershipCode(membershipType: string) {
  const t = String(membershipType || "").toLowerCase();

  // more specific first
  if (t.includes("professional") && t.includes("fellowship")) return "PF";
  if (t.includes("honorary")) return "H";
  if (t.includes("affiliate")) return "AF"; // avoids clash with Associate
  if (t.includes("associate")) return "A";
  if (t.includes("technical")) return "T";
  if (t.includes("professional") && t.includes("membership")) return "PM";

  return "M"; // fallback
}

/* ===== helper: generate unique certificate id (membership number) ===== */
async function generateUniqueCertificateId(membershipType: string) {
  const code = getMembershipCode(membershipType);

  // try a few times to avoid collisions
  for (let i = 0; i < 20; i++) {
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const certId = `ECRMI-${code}-${random4}`;

    const existsInApps = await MembershipApplication.exists({
      certificateId: certId,
    });

    const existsInMembers = await Member.exists({
      certificateId: certId,
    });

    if (!existsInApps && !existsInMembers) return certId;
  }

  // fallback (very unlikely)
  return `ECRMI-${code}-${Date.now()}`;
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

  // Ensure new applications have an ID at least once approved
  if (status === "approved" && !app.isUpdateRequest) {
    if (!app.certificateId || String(app.certificateId).trim() === "") {
      app.certificateId = await generateUniqueCertificateId(finalApprovedType);
    }
  }

  await app.save();

  // ✅ If approved → move/update into Members collection (and handle history + id changes)
  if (status === "approved") {
    const memberDoc = await Member.findOne({ email: app.email }); // <-- use Member record (not lean)

    const desiredCode = getMembershipCode(finalApprovedType);

    const memberCurrentCertId = memberDoc
      ? String(memberDoc.certificateId || memberDoc.memberId || "").trim()
      : "";

    const memberCurrentCode = memberCurrentCertId.split("-")?.[1]?.toUpperCase() || "";

    const shouldRegenerateIdBecauseTypeChanged =
      !!memberDoc && !!memberCurrentCertId && memberCurrentCode && memberCurrentCode !== desiredCode;

    // If type changed => store old in history + create new current id
    let certificateIdToUse = "";

    if (shouldRegenerateIdBecauseTypeChanged) {
      const oldCertId = memberCurrentCertId;

      // avoid duplicate history entries
      const history = Array.isArray((memberDoc as any).certificateHistory)
        ? (memberDoc as any).certificateHistory
        : [];

      const alreadyInHistory = history.some(
        (h: any) =>
          String(h?.certificateId || "").trim().toLowerCase() ===
          oldCertId.toLowerCase()
      );

      if (!alreadyInHistory) {
        (memberDoc as any).certificateHistory = history.concat([
          {
            certificateId: oldCertId,
            membershipType: memberDoc!.membershipType,
            issuedAt:
              memberDoc!.membershipStartDate ??
              memberDoc!.updatedAt ??
              memberDoc!.createdAt ??
              new Date(),
            certificateUrl: memberDoc!.certificateUrl ?? "",
            letterUrl: memberDoc!.letterUrl ?? "",
          },
        ]);
      }

      const newCertId = await generateUniqueCertificateId(finalApprovedType);
      certificateIdToUse = newCertId;

      // Update the application too so it matches the new current membership number
      app.certificateId = newCertId;
      await app.save();
    } else {
      // Otherwise keep existing member id, or fall back to application id (new approvals)
      certificateIdToUse =
        memberCurrentCertId ||
        String(app.certificateId || "").trim() ||
        (app.isUpdateRequest ? "" : await generateUniqueCertificateId(finalApprovedType));
    }

    const memberPayload: any = {
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

      certificateUrl: app.certificateUrl ?? memberDoc?.certificateUrl ?? "",
      letterUrl: app.letterUrl ?? memberDoc?.letterUrl ?? "",

      membershipStartDate:
        memberDoc?.membershipStartDate ??
        app.reviewedAt ??
        app.updatedAt ??
        app.createdAt,

      status: "active",
      applicationId: app.applicationId ?? memberDoc?.applicationId ?? "",
      sourceApplicationObjectId: app._id,
    };

    if (certificateIdToUse) {
      memberPayload.certificateId = certificateIdToUse;
      memberPayload.memberId = certificateIdToUse;
    }

    if (memberDoc) {
      // keep existing history (already updated above if needed)
      const existingHistory = (memberDoc as any).certificateHistory;
      memberDoc.set(memberPayload);
      if (existingHistory) {
        (memberDoc as any).certificateHistory = existingHistory;
      }
      await memberDoc.save();
    } else {
      await Member.findOneAndUpdate(
        { email: app.email },
        { $set: memberPayload },
        { upsert: true, new: true }
      );
    }
  }

  return NextResponse.json({ success: true });
}