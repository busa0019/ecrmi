import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const records = await MembershipApplication.find();

  const headers = [
    "Full Name",
    "Email",
    "Requested Type",
    "Approved Type",
    "Status",
    "Created At",
  ];

  const rows = records.map((r) =>
    [
      r.fullName,
      r.email,
      r.requestedMembershipType,
      r.approvedMembershipType,
      r.status,
      r.createdAt?.toISOString(),
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        "attachment; filename=memberships.csv",
    },
  });
}