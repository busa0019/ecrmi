import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ REAL protection
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const mode = body?.mode as string | undefined;
    const importTag = body?.importTag as string | undefined;

    await connectDB();

    // ✅ Delete a specific batch (best option)
    if (importTag) {
      const result = await MembershipApplication.deleteMany({
        adminNotes: importTag,
      });

      return NextResponse.json({
        success: true,
        deleted: result.deletedCount,
        by: "importTag",
        importTag,
      });
    }

    // ✅ Cleanup old junk test imports (your earlier broken records)
    if (!mode || mode === "imported-only") {
      const result = await MembershipApplication.deleteMany({
        status: "approved",
        applicationId: { $exists: false },
        certificateId: { $exists: false },
      });

      return NextResponse.json({
        success: true,
        deleted: result.deletedCount,
        by: "mode",
        mode: "imported-only",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Bulk delete error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}