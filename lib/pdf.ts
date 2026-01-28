import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { generateQR } from "./qr";

/* ================= UTIL ================= */

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ================= TEXT HELPERS ================= */

function drawCenteredText({
  page,
  text,
  y,
  size,
  font,
  pageWidth,
}: {
  page: any;
  text: string;
  y: number;
  size: number;
  font: any;
  pageWidth: number;
}) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = (pageWidth - textWidth) / 2;

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawWrappedCenteredText({
  page,
  text,
  y,
  maxWidth,
  font,
  size,
  lineHeight = size + 8,
  pageWidth,
}: {
  page: any;
  text: string;
  y: number;
  maxWidth: number;
  font: any;
  size: number;
  lineHeight?: number;
  pageWidth: number;
}) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth > maxWidth) {
      const x =
        (pageWidth -
          font.widthOfTextAtSize(line.trim(), size)) /
        2;

      page.drawText(line.trim(), {
        x,
        y: cursorY,
        size,
        font,
        color: rgb(0, 0, 0),
      });

      line = word + " ";
      cursorY -= lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line.trim()) {
    const x =
      (pageWidth -
        font.widthOfTextAtSize(line.trim(), size)) /
      2;

    page.drawText(line.trim(), {
      x,
      y: cursorY,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return cursorY;
}

/* ================= MAIN PDF ================= */

export async function generatePDF(
  name: string,
  course: string,
  certificateId: string
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 Landscape
  const { width } = page.getSize();

  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  /* ================= BACKGROUND ================= */

  const templatePath = path.join(
    process.cwd(),
    "public/certificate-template.jpg"
  );
  const templateBytes = fs.readFileSync(templatePath);
  const templateImage = await pdf.embedJpg(templateBytes);

  page.drawImage(templateImage, {
    x: 0,
    y: 0,
    width: 842,
    height: 595,
  });

  /* ================= TEXT ================= */

  drawCenteredText({
    page,
    text: "This is to certify that",
    y: 380,
    size: 20,
    font: regularFont,
    pageWidth: width,
  });

  drawCenteredText({
    page,
    text: name.toUpperCase(),
    y: 330,
    size: 38,
    font: boldFont,
    pageWidth: width,
  });

  page.drawLine({
    start: { x: 220, y: 320 },
    end: { x: 620, y: 320 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  drawCenteredText({
    page,
    text: "has successfully completed the course",
    y: 295,
    size: 18,
    font: regularFont,
    pageWidth: width,
  });

  /* ✅ COURSE TITLE (WRAPPED SAFELY) */
  const afterCourseY = drawWrappedCenteredText({
    page,
    text: course,
    y: 265,
    maxWidth: 620,
    font: boldFont,
    size: 20,
    pageWidth: width,
  });

  /* ✅ OFFERED BY (PUSHED DOWN) */
  drawCenteredText({
    page,
    text:
      "Offered by: Emergency, Crisis & Disaster Risk Management Institute (ECRMI)",
    y: afterCourseY - 18,
    size: 15,
    font: boldFont,
    pageWidth: width,
  });

  /* ✅ AWARDED ON */
  drawCenteredText({
    page,
    text: `Awarded on: ${formatDate(new Date())}`,
    y: afterCourseY - 42,
    size: 14,
    font: boldFont,
    pageWidth: width,
  });

  /* ✅ CERTIFICATE VERIFICATION CODE (CENTERED, AFTER AWARD DATE) */
  drawCenteredText({
    page,
    text: "Certificate Verification Code",
    y: afterCourseY - 64,
    size: 12,
    font: boldFont,
    pageWidth: width,
  });

  drawCenteredText({
    page,
    text: certificateId,
    y: afterCourseY - 82,
    size: 14,
    font: boldFont,
    pageWidth: width,
  });

  /* ================= QR CODE ================= */

  const verifyUrl = `https://training.ecrmi.org/verify/${certificateId}`;
  const qrDataUrl = await generateQR(verifyUrl);

  const qrImageBytes = Buffer.from(
    qrDataUrl.split(",")[1],
    "base64"
  );
  const qrImage = await pdf.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: 660,
    y: 110,
    width: 110,
    height: 110,
  });

  return await pdf.save();
}