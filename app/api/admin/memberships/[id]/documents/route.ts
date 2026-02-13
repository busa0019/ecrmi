export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  // ✅ FIX: unwrap params properly
  const { id } = await context.params;

  const app = await MembershipApplication.findById(id);

  if (!app) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  const archive = archiver("zip", { zlib: { level: 9 } });

  const tempZipPath = path.join(
    process.cwd(),
    "public",
    `temp-${id}.zip`
  );

  const output = fs.createWriteStream(tempZipPath);
  archive.pipe(output);

  // ✅ ADD FILES IF THEY EXIST
  if (app.cvUrl) {
    const cvPath = path.join(process.cwd(), "public", app.cvUrl);
    if (fs.existsSync(cvPath)) {
      archive.file(cvPath, { name: "cv.pdf" });
    }
  }

  if (app.certificatesUrl?.length > 0) {
    app.certificatesUrl.forEach((file: string, index: number) => {
      const filePath = path.join(process.cwd(), "public", file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: `certificate-${index + 1}` });
      }
    });
  }

  if (app.paymentReceiptUrl) {
    const receiptPath = path.join(process.cwd(), "public", app.paymentReceiptUrl);
    if (fs.existsSync(receiptPath)) {
      archive.file(receiptPath, { name: "payment-receipt" });
    }
  }

  await archive.finalize();

  await new Promise<void>((resolve, reject) => {
  output.on("close", () => resolve());
  output.on("error", (err) => reject(err));
});

  const zipBuffer = fs.readFileSync(tempZipPath);

  fs.unlinkSync(tempZipPath); // delete temp file

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=documents-${id}.zip`,
    },
  });
}