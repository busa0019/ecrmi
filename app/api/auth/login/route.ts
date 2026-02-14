import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({
    id: admin._id.toString(),
    email: admin.email,
  });

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day (matches JWT)
  });

  return Response.json({ success: true });
}