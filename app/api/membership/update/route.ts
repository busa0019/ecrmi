export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());
}

function normalizeCertificatesUrl(data: any): string[] {
  const raw =
    data?.certificatesUrl ?? data?.certificateUrls ?? data?.certificateUrl;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") return raw.trim() ? [raw.trim()] : [];
  return [];
}

/* ================= LOOKUP MEMBER ================= */
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const lookupRaw = searchParams.get("lookup");
  const lookup = String(lookupRaw ?? "").trim().toLowerCase();

  if (!lookup) return NextResponse.json({ success: false });

  // ✅ FIRST: check pending update
  let record = await MembershipApplication.findOne({
    email: lookup,
    isUpdateRequest: true,
    status: "pending",
  }).sort({ createdAt: -1 });

  // ✅ IF NO UPDATE → load approved
  if (!record) {
    record = await MembershipApplication.findOne({
      email: lookup,
      status: "approved",
    }).sort({ createdAt: -1 });
  }

  if (!record) return NextResponse.json({ success: false });

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
        record.approvedMembershipType || record.requestedMembershipType || "",
      cvUrl: record.cvUrl || "",
      certificatesUrl: Array.isArray(record.certificatesUrl)
        ? record.certificatesUrl
        : [],
    },
  });
}

/* ================= SUBMIT (update request OR new application) ================= */
export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  const email = String(data?.email ?? "").trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const certificatesUrl = normalizeCertificatesUrl(data);

  const originalId = String(data?._id ?? "").trim();
  const original = originalId ? await MembershipApplication.findById(originalId) : null;

  // ✅ CASE 1: record NOT found → create new application (shows under New Applications)
  if (!original) {
    const fullName = String(data?.fullName ?? "").trim();
    const membershipType = String(data?.membershipType ?? "").trim();

    if (!fullName) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }
    if (!membershipType) {
      return NextResponse.json(
        { success: false, error: "Membership type is required." },
        { status: 400 }
      );
    }

    await MembershipApplication.create({
      fullName,
      email,

      requestedMembershipType: membershipType,

      jobTitle: data.jobTitle ?? "",
      organization: data.organization ?? "",
      natureOfWork: data.natureOfWork ?? "",
      yearsOfExperience: data.yearsOfExperience ?? "",

      cvUrl: data.cvUrl ?? "",
      certificatesUrl,

      status: "pending",
      isUpdateRequest: false,
    });

    return NextResponse.json({ success: true, mode: "new" });
  }

  // ✅ CASE 2: record found → create update request (shows under Pending Update Requests)
  await MembershipApplication.create({
    fullName: original.fullName,
    email: original.email,

    requestedMembershipType:
      original.approvedMembershipType || original.requestedMembershipType,

    certificateId: original.certificateId, // keep reference

    jobTitle: data.jobTitle ?? "",
    organization: data.organization ?? "",
    natureOfWork: data.natureOfWork ?? "",
    yearsOfExperience: data.yearsOfExperience ?? "",

    cvUrl: data.cvUrl || original.cvUrl,

    certificatesUrl: certificatesUrl.length > 0 ? certificatesUrl : original.certificatesUrl,

    status: "pending",
    isUpdateRequest: true,
  });

  return NextResponse.json({ success: true, mode: "update" });
}