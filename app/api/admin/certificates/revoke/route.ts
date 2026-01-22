import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }

  await connectDB();

  const form = await req.formData();
  const id = form.get("id") as string;

  await Certificate.findByIdAndDelete(id);

  redirect("/admin/certificates");
}