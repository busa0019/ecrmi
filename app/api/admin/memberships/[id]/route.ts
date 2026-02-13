export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import Member from "@/models/Member";
import { NextResponse } from "next/server";

/* ===== GET SINGLE APPLICATION ===== */
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(app);
}

/* ===== APPROVE / REJECT ===== */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { status, approvedMembershipType, adminNotes } =
    await req.json();

  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  // ✅ Update application record
  app.status = status;
  app.approvedMembershipType = approvedMembershipType;
  app.adminNotes = adminNotes;
  app.reviewedAt = new Date();

  await app.save();

  // ✅ If approved → move/update into Members collection
  if (status === "approved") {
    await Member.findOneAndUpdate(
      { email: app.email },
      {
        memberId: app.certificateId || `ECRMI-MEM-${Date.now()}`,
        fullName: app.fullName,
        email: app.email,
        membershipType: approvedMembershipType,
        jobTitle: app.jobTitle,
        organization: app.organization,
        natureOfWork: app.natureOfWork,
        yearsOfExperience: app.yearsOfExperience,
        cvUrl: app.cvUrl,
        certificatesUrl: app.certificatesUrl,
        membershipStartDate: new Date(),
        certificateUrl: app.certificateUrl,
        letterUrl: app.letterUrl,
      },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true });
}