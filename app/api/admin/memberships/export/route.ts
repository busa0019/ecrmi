import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const records = await MembershipApplication.find();

  const header = "Name,Email,Requested,Approved,Status\n";
  const rows = records.map((r) =>
    `${r.fullName},${r.email},${r.requestedMembershipType},${r.approvedMembershipType},${r.status}`
  );

  return new NextResponse(header + rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=memberships.csv",
    },
  });
}