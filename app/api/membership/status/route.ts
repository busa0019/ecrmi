import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lookup = searchParams.get("lookup")?.trim().toLowerCase();

  if (!lookup) {
    return NextResponse.json({ success: false });
  }

  await connectDB();

  const app = await MembershipApplication.findOne({
    email: lookup,
  });

  if (!app) {
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({
    success: true,
    status: app.status,
    fullName: app.fullName,
    membershipType:
      app.approvedMembershipType || app.requestedMembershipType,

   
    certificateId: app.certificateId || null,
    letterId: app.letterId || null,
  });
}