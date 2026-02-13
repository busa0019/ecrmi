import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const apps = await MembershipApplication.find().sort({
    createdAt: -1,
  });
  return NextResponse.json(apps);
}