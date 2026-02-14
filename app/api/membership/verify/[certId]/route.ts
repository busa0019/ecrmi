import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // recommended for mongoose

export async function GET(
  _req: Request,
  { params }: { params: { certId: string } }
) {
  try {
    await connectDB();

    const { certId } = params;

    const record = await MembershipApplication.findOne({
      certificateId: certId,
      status: "approved",
    }).lean();

    if (!record) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        valid: true,
        name: record.fullName,
        membershipType: record.approvedMembershipType,
        issuedAt: record.reviewedAt ?? record.updatedAt ?? record.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify membership error:", error);
    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}