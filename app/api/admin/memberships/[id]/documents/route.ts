export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  // ✅ Unwrap params (Next.js 15+)
  const { id } = await context.params;

  const app = await MembershipApplication.findById(id);

  if (!app) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  const archive = archiver("zip", { zlib: { level: 9 } });

  // ✅ Use /tmp for Vercel (NOT public folder)
  const tempZipPath = path.join(
    "/tmp",
    `temp-${id}.zip`
  );

  const output = fs.createWriteStream(tempZipPath);

  archive.pipe(output);

  /* ================= ADD FILES ================= */

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
        archive.file(filePath, {
          name: `certificate-${index + 1}.pdf`,
        });
      }
    });
  }

  if (app.paymentReceiptUrl) {
    const receiptPath = path.join(
      process.cwd(),
      "public",
      app.paymentReceiptUrl
    );
    if (fs.existsSync(receiptPath)) {
      archive.file(receiptPath, {
        name: "payment-receipt.pdf",
      });
    }
  }

  await archive.finalize();

  // ✅ Proper Promise handling for Vercel build
  await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("error", (err) => reject(err));
  });

  const zipBuffer = fs.readFileSync(tempZipPath);

  // ✅ Clean up temp file
  fs.unlinkSync(tempZipPath);

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=documents-${id}.zip`,
    },
  });
}