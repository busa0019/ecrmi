export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  await connectDB();

  const { certId } = await params;

  const app = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
  });

  if (!app) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 }
    );
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  /* Load template */
  const templatePath = path.join(
    process.cwd(),
    "public/certificates/templates",
    "associate.jpeg" // or use your mapping function
  );

  const templateBytes = fs.readFileSync(templatePath);
  const template = await pdfDoc.embedJpg(templateBytes);

  page.drawImage(template, {
    x: 0,
    y: 0,
    width: 842,
    height: 595,
  });

  /* ✅ NAME (same position you finalized) */
  const nameSize = 36;
  const nameWidth = bold.widthOfTextAtSize(app.fullName, nameSize);

  page.drawText(app.fullName, {
    x: (842 - nameWidth) / 2,
    y: 380,
    size: nameSize,
    font: bold,
  });

  /* ✅ Membership number */
  page.drawText(certId, {
    x: 235,
    y: 102,
    size: 11,
    font: bold,
  });

  /* ✅ QR Code */
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const qrDataUrl = await QRCode.toDataURL(
    `${baseUrl}/membership/verify/${certId}`
  );

  const qrImage = await pdfDoc.embedPng(
    Buffer.from(qrDataUrl.split(",")[1], "base64")
  );

  page.drawImage(qrImage, {
    x: 680,
    y: 70,
    width: 100,
    height: 100,
  });

 const pdfBytes = await pdfDoc.save();

const buffer = Buffer.from(pdfBytes);

return new NextResponse(buffer, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=letter-${certId}.pdf`,
  },
});
}