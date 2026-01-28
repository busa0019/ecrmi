import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const code = params.id.toUpperCase().trim();

    const cert = await Certificate.findOne({
      certificateId: code,
    }).lean();

    if (!cert) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      cert,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);

    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}