import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // ✅ FIX: explicitly type parsed records
  const records = parse(buffer.toString(), {
    columns: true,
    skip_empty_lines: true,
  }) as {
    fullName: string;
    email: string;
    membershipType: string;
  }[];

  await connectDB();

  for (const row of records) {
    await MembershipApplication.create({
      fullName: row.fullName,
      email: row.email,

      // ✅ FIXED
      requestedMembershipType: row.membershipType,
      approvedMembershipType: row.membershipType,

      status: "approved",
      reviewedAt: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}