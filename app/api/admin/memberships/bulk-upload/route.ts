import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

function generateApplicationId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ECRMI-MEM-${year}-${rand}`;
}

function generateCertificateId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ECRMI-MEM-${rand}`;
}

export async function POST(req: Request) {
  try {
    // ✅ REAL protection
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const records = parse<Record<string, string>>(buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    await connectDB();

    const importTag = `csv_import_${Date.now()}`;

    let created = 0;
    let skipped = 0;

    for (const row of records) {
      const fullName = String(
        row.fullName ?? row.FullName ?? row.name ?? row.Name ?? ""
      ).trim();

      const email = String(row.email ?? row.Email ?? "").trim();

      const membershipType = String(
        row.membershipType ??
          row.MembershipType ??
          row.requestedMembershipType ??
          row.RequestedMembershipType ??
          ""
      ).trim();

      if (!fullName && !email && !membershipType) {
        skipped++;
        continue;
      }

      await MembershipApplication.create({
        applicationId: generateApplicationId(),

        fullName,
        email,

        requestedMembershipType: membershipType,
        approvedMembershipType: membershipType,

        status: "approved",
        reviewedAt: new Date(),

        certificateId: generateCertificateId(),

        adminNotes: importTag,
        isUpdateRequest: false,

        certificatesUrl: [],
      });

      created++;
    }

    return NextResponse.json({ success: true, created, skipped, importTag });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}