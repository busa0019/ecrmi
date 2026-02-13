import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

function generateApplicationId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ECRMI-MEM-${year}-${rand}`;
}

export async function POST(req: Request) {
  const data = await req.json();
  await connectDB();

  const app = await MembershipApplication.create({
    applicationId: generateApplicationId(),

    // Personal
    fullName: data.fullName,
    email: data.email,
    nationality: data.nationality,
    state: data.state,

    // ✅ FIXED: correct field
    requestedMembershipType: data.membershipType,

    // Professional
    jobTitle: data.jobTitle,
    organization: data.organization,
    natureOfWork: data.natureOfWork,
    yearsOfExperience: Number(data.yearsOfExperience),

    // Documents
    cvUrl: data.cvUrl,
  certificatesUrl: data.certificatesUrl
  ? [data.certificatesUrl]
  : [],
    paymentReceiptUrl: data.paymentReceiptUrl,

    status: "pending",
  });

  return NextResponse.json({
    success: true,
    id: app._id,
  });
}