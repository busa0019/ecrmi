import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    await connectDB();

    const { certId } = await params;

    // ✅ HARD GUARD: prevent undefined/empty certId from matching random records
    if (!certId || typeof certId !== "string" || certId.trim().length < 3) {
      return NextResponse.json(
        { valid: false, error: "Missing certificate ID" },
        { status: 400 }
      );
    }

    // Optional: log to confirm what you’re receiving
    // console.log("VERIFY certId:", certId);

    const record = await MembershipApplication.findOne({
      certificateId: certId.trim(),
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
        certificateId: record.certificateId, // ✅ include for debugging/display if you want
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