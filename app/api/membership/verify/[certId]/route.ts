import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyMembership } from "@/lib/verifyMembership";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params;

    if (!certId || typeof certId !== "string" || certId.trim().length < 3) {
      return NextResponse.json(
        { valid: false, error: "Missing certificate ID" },
        { status: 400 }
      );
    }

    const data = await verifyMembership(certId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Verify membership error:", error);
    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}