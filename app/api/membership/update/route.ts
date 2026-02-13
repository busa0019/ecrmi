export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

/* ================= LOOKUP MEMBER ================= */
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const lookup = searchParams.get("lookup");

  if (!lookup) {
    return NextResponse.json({ success: false });
  }

  // ✅ FIRST: check pending update
  let record = await MembershipApplication.findOne({
    email: lookup.toLowerCase(),
    isUpdateRequest: true,
    status: "pending",
  }).sort({ createdAt: -1 });

  // ✅ IF NO UPDATE → load approved
  if (!record) {
    record = await MembershipApplication.findOne({
      email: lookup.toLowerCase(),
      status: "approved",
    }).sort({ createdAt: -1 });
  }

  if (!record) {
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({
    success: true,
    member: {
      _id: record._id,
      fullName: record.fullName || "",
      email: record.email || "",
      jobTitle: record.jobTitle || "",
      organization: record.organization || "",
      natureOfWork: record.natureOfWork || "",
      yearsOfExperience: record.yearsOfExperience || "",
      membershipType:
        record.approvedMembershipType ||
        record.requestedMembershipType ||
        "",
      cvUrl: record.cvUrl || "",
      certificatesUrl: record.certificatesUrl || [],
    },
  });
}

/* ================= CREATE UPDATE REQUEST ================= */
export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  const original = await MembershipApplication.findById(data._id);

  if (!original) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  await MembershipApplication.create({
    fullName: original.fullName,
    email: original.email,
    requestedMembershipType:
      original.approvedMembershipType ||
      original.requestedMembershipType,

    jobTitle: data.jobTitle,
    organization: data.organization,
    natureOfWork: data.natureOfWork,
    yearsOfExperience: data.yearsOfExperience,

    cvUrl: data.cvUrl || original.cvUrl,

    // ✅ FIXED
    certificatesUrl:
      data.certificatesUrl && data.certificatesUrl.length > 0
        ? data.certificatesUrl
        : original.certificatesUrl,

    status: "pending",
    isUpdateRequest: true,
  });

  return NextResponse.json({ success: true });
}