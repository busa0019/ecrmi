export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

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
  const ext = path.extname(file.name);
  const fileName =
    crypto.randomBytes(8).toString("hex") + ext;

  // ✅ Use /tmp in serverless environments
  const uploadDir = path.join("/tmp", "uploads", "membership");

  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    url: `/uploads/membership/${fileName}`, // keep same response
  });
}