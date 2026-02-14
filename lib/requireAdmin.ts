import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded; // { id, email, iat, exp } or null
}