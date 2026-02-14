import { cookies } from "next/headers";
import { verifyToken, hashPassword, comparePassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    const decoded = token ? verifyToken(token) : null;
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { email, currentPassword, newPassword } = await req.json();

    if (!currentPassword || String(currentPassword).trim() === "") {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      );
    }

    const hasEmailChange = email !== undefined && String(email).trim() !== "";
    const hasPasswordChange =
      newPassword !== undefined && String(newPassword).trim() !== "";

    if (!hasEmailChange && !hasPasswordChange) {
      return NextResponse.json(
        { error: "Provide a new email or a new password" },
        { status: 400 }
      );
    }

    if (hasEmailChange && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (hasPasswordChange && String(newPassword).trim().length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // ✅ update the logged-in admin specifically
    const admin = await Admin.findById((decoded as any).id);
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const valid = await comparePassword(currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    if (hasEmailChange) admin.email = String(email).trim();
    if (hasPasswordChange) {
      admin.passwordHash = await hashPassword(String(newPassword).trim());
    }

    await admin.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin settings error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}