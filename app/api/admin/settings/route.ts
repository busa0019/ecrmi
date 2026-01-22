import { cookies } from "next/headers";
import { verifyToken, hashPassword, comparePassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  const { email, currentPassword, newPassword } =
    await req.json();

  const admin = await Admin.findOne();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin not found" },
      { status: 404 }
    );
  }

  const valid = await comparePassword(
    currentPassword,
    admin.passwordHash
  );

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 403 }
    );
  }

  if (email) admin.email = email;
  if (newPassword)
    admin.passwordHash = await hashPassword(newPassword);

  await admin.save();

  return NextResponse.json({ success: true });
}