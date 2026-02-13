export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

function formatDateWithOrdinal(date: Date) {
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });

  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${month} ${day}${ordinal}, ${year}`;
}

function getAcronym(type: string) {
  return type
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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
      { error: "Letter not found" },
      { status: 404 }
    );
  }

  const formattedDate = formatDateWithOrdinal(app.reviewedAt);
  const acronym = getAcronym(app.approvedMembershipType);

  const pdfDoc = await PDFDocument.create();

  const letterBgPath = path.join(
    process.cwd(),
    "public/certificates/letters/letterhead.jpeg"
  );

  const letterBgBytes = fs.readFileSync(letterBgPath);
  const letterBg = await pdfDoc.embedJpg(letterBgBytes);

  const pageWidth = letterBg.width;
  const pageHeight = letterBg.height;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  page.drawImage(letterBg, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  function drawWrapped(text: string, x: number, y: number) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const width = font.widthOfTextAtSize(testLine, 11);

      if (width > pageWidth - 140 && i > 0) {
        page.drawText(line.trim(), {
          x,
          y: currentY,
          size: 11,
          font,
        });
        line = words[i] + " ";
        currentY -= 16;
      } else {
        line = testLine;
      }
    }

    page.drawText(line.trim(), {
      x,
      y: currentY,
      size: 11,
      font,
    });

    return currentY - 20;
  }

  let y = pageHeight - 180;

  /* DATE */
  page.drawText(formattedDate, { x: 70, y, size: 12, font });
  y -= 18;

  /* NAME */
  page.drawText(app.fullName, { x: 70, y, size: 12, font: bold });
  y -= 22;

  page.drawText("Dear Sir/Madam,", { x: 70, y, size: 12, font });
  y -= 28;

  const subject = `ELECTION AS AN ${app.approvedMembershipType.toUpperCase()}`;
  const subjectWidth = bold.widthOfTextAtSize(subject, 14);
  const subjectX = (pageWidth - subjectWidth) / 2;

  page.drawText(subject, {
    x: subjectX,
    y,
    size: 14,
    font: bold,
  });

  page.drawLine({
    start: { x: subjectX, y: y - 2 },
    end: { x: subjectX + subjectWidth, y: y - 2 },
    thickness: 1,
  });

  y -= 30;

  y = drawWrapped(
    `We refer to your recent application for membership of this Institute and we are glad to inform you that the Management has approved your election as an ${app.approvedMembershipType.toUpperCase()} with effect from ${formattedDate}.`,
    70,
    y
  );

  y = drawWrapped(
    `Your membership number is ${certId} which should be quoted in all correspondence with the Institute.`,
    70,
    y
  );

  y -= 20;

  y = drawWrapped(
    `The use of the acronym "${acronym}" after your name is hereby authorized.`,
    70,
    y
  );

  y -= 20;

  y = drawWrapped(
    `While waiting to see you at the induction ceremony accept my congratulations!`,
    70,
    y
  );

  y -= 30;

  /* CLOSING */
  page.drawText("Yours faithfully,", {
    x: 70,
    y,
    size: 11,
    font,
  });

  y -= 25;

  page.drawText(
    "For: Emergency, Crisis & Disaster Risk Management Institute",
    { x: 70, y, size: 11, font }
  );

  y -= 35;

  page.drawText("Priscilla Johnson", {
    x: 70,
    y,
    size: 12,
    font: bold,
  });

  y -= 18;

  page.drawText("Membership Service Officer", {
    x: 70,
    y,
    size: 11,
    font,
  });

  y -= 18;

  page.drawText("08113907191", {
    x: 70,
    y,
    size: 11,
    font,
  });

  y -= 18;

  page.drawText("registrarecrmi@yahoo.com", {
    x: 70,
    y,
    size: 11,
    font,
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