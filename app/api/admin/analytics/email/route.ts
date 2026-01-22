import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import { sendAnalyticsEmail } from "@/lib/email";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const total = await Attempt.countDocuments();
  const passed = await Attempt.countDocuments({ passed: true });
  const passRate =
    total === 0 ? 0 : Math.round((passed / total) * 100);

  await sendAnalyticsEmail({
    to: "training@ecrmi.org.ng",
    total,
    passed,
    passRate,
  });

  return new Response("Email sent");
}