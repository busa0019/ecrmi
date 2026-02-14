import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

function generateApplicationId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ECRMI-MEM-${year}-${rand}`;
}

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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();

    const email = String(data.email ?? "").trim();
    const fullName = String(data.fullName ?? "").trim();

    if (!fullName) {
      return NextResponse.json(
        { success: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const certificatesUrl = normalizeCertificatesUrl(data);

    const app = await MembershipApplication.create({
      applicationId: generateApplicationId(),

      // Personal (optional extras kept for compatibility)
      fullName,
      email,
      nationality: data.nationality ?? "",
      state: data.state ?? "",

      // Membership
      requestedMembershipType:
        data.membershipType ?? data.requestedMembershipType ?? "",

      // Professional (optional)
      jobTitle: data.jobTitle ?? "",
      organization: data.organization ?? "",
      natureOfWork: data.natureOfWork ?? "",
      yearsOfExperience:
        data.yearsOfExperience !== undefined && data.yearsOfExperience !== ""
          ? Number(data.yearsOfExperience)
          : 0,

      // Documents
      cvUrl: data.cvUrl ?? "",
      certificatesUrl,
      paymentReceiptUrl: data.paymentReceiptUrl ?? "",

      status: "pending",
      isUpdateRequest: false,
    });

    return NextResponse.json({ success: true, id: app._id });
  } catch (err) {
    console.error("Membership apply error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}