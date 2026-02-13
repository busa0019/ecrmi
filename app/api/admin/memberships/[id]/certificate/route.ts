export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

/* ================= DATE FORMAT ================= */
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

/* ================= INITIAL ACRONYM ================= */
function getAcronym(type: string) {
  return type
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ================= TEMPLATE MAP ================= */
function getCertTemplate(type: string) {
  const map: Record<string, string> = {
    "Student Member": "student.jpg",
    "Affiliate Member": "affiliate.jpeg",
    "Graduate Member": "graduate.jpeg",
    "Associate Member": "associate.jpeg",
    "Technical Member": "technical.png",
    "Professional Member": "professional.png",
    "Fellow": "fellow.png",
    "Honorary Member": "honorary.png",
  };
  return map[type];
}

/* ================= FEE STRUCTURE ================= */
function getFeeStructure(type: string) {
  const fees: Record<string, any> = {
    "Associate Member": { induction: 50000, annual: 15000, training: 10000 },
    "Technical Member": { induction: 50000, annual: 20000, training: 20000 },
    "Professional Member": { induction: 75000, annual: 15000, training: 10000 },
    "Fellow": { induction: 160000, annual: 25000, training: 0 },
    "Graduate Member": { induction: 50000, annual: 15000, training: 10000 },
    "Student Member": { induction: 50000, annual: 15000, training: 10000 },
  };
  return fees[type] || fees["Associate Member"];
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectDB();

  const app = await MembershipApplication.findById(id);

  if (!app || app.status !== "approved") {
    return NextResponse.json({ error: "Application not approved" }, { status: 400 });
  }

  const random4 = Math.floor(1000 + Math.random() * 9000);
  const certId = `ECRMI-MEM-${random4}`;

  const issuedAt = new Date();
  const formattedDate = formatDateWithOrdinal(issuedAt);

  const fee = getFeeStructure(app.approvedMembershipType);
  const total = fee.induction + fee.annual + fee.training;
  const acronym = getAcronym(app.approvedMembershipType);

  const outputDir = path.join(process.cwd(), "public/certificates/generated");
  fs.mkdirSync(outputDir, { recursive: true });

  const certPath = path.join(outputDir, `${certId}.pdf`);
  const letterPath = path.join(outputDir, `${certId}-letter.pdf`);
/* ================= CERTIFICATE ================= */

/* ================= CERTIFICATE ================= */

const certPdf = await PDFDocument.create();
const certPage = certPdf.addPage([842, 595]);

const certFont = await certPdf.embedFont(StandardFonts.Helvetica);
const certBold = await certPdf.embedFont(StandardFonts.HelveticaBold);

/* Load background */
const templateFile = getCertTemplate(app.approvedMembershipType);
const templatePath = path.join(
  process.cwd(),
  "public/certificates/templates",
  templateFile
);

const templateBytes = fs.readFileSync(templatePath);

const certTemplate = templateFile.endsWith(".png")
  ? await certPdf.embedPng(templateBytes)
  : await certPdf.embedJpg(templateBytes);

certPage.drawImage(certTemplate, {
  x: 0,
  y: 0,
  width: 842,
  height: 595,
});

/* ================= NAME (FIXED POSITION) ================= */

const nameSize = 36;
const nameWidth = certBold.widthOfTextAtSize(app.fullName, nameSize);

/* ✅ THIS IS THE CORRECT BLANK AREA */
certPage.drawText(app.fullName, {
  x: (842 - nameWidth) / 2,
  y: 380, // ✅ Correct vertical alignment
  size: nameSize,
  font: certBold,
});

/* ================= MEMBERSHIP NUMBER ================= */
/* Template already prints "Membership No." */

certPage.drawText(certId, {
  x: 234, // ✅ aligned after printed label
  y: 100.5,  // ✅ exact line level
  size: 10.5,
  font: certBold,
});

/* ================= QR CODE ================= */

const qrDataUrl = await QRCode.toDataURL(
  `${process.env.NEXT_PUBLIC_BASE_URL}/membership/verify/${certId}`
);

const qrImage = await certPdf.embedPng(
  Buffer.from(qrDataUrl.split(",")[1], "base64")
);

certPage.drawImage(qrImage, {
  x: 680,
  y: 70,
  width: 100,
  height: 100,
});

/* SAVE */
fs.writeFileSync(certPath, await certPdf.save());

  /* ================= LETTER ================= */

const letterPdf = await PDFDocument.create();

const letterBgPath = path.join(
  process.cwd(),
  "public/certificates/letters/letterhead.jpeg"
);
const letterBgBytes = fs.readFileSync(letterBgPath);
const letterBg = await letterPdf.embedJpg(letterBgBytes);

const pageWidth = letterBg.width;
const pageHeight = letterBg.height;

const letterPage = letterPdf.addPage([pageWidth, pageHeight]);

letterPage.drawImage(letterBg, {
  x: 0,
  y: 0,
  width: pageWidth,
  height: pageHeight,
});

const letterFont = await letterPdf.embedFont(StandardFonts.Helvetica);
const letterBold = await letterPdf.embedFont(StandardFonts.HelveticaBold);

function drawWrapped(text: string, x: number, y: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const width = letterFont.widthOfTextAtSize(testLine, 11);

    if (width > pageWidth - 140 && i > 0) {
      letterPage.drawText(line.trim(), {
        x,
        y: currentY,
        size: 11,
        font: letterFont,
      });
      line = words[i] + " ";
      currentY -= 16;
    } else {
      line = testLine;
    }
  }

  letterPage.drawText(line.trim(), {
    x,
    y: currentY,
    size: 11,
    font: letterFont,
  });

  return currentY - 20;
}

let y = pageHeight - 180;

/* DATE */
letterPage.drawText(formattedDate, { x: 70, y, size: 12, font: letterFont });
y -= 18;

/* NAME */
letterPage.drawText(app.fullName, { x: 70, y, size: 12, font: letterBold });
y -= 22;

/* SALUTATION */
letterPage.drawText("Dear Sir/Madam,", { x: 70, y, size: 12, font: letterFont });
y -= 28;

/* SUBJECT */
const subject = `ELECTION AS AN ${app.approvedMembershipType.toUpperCase()}`;
const subjectWidth = letterBold.widthOfTextAtSize(subject, 14);
const subjectX = (pageWidth - subjectWidth) / 2;

letterPage.drawText(subject, {
  x: subjectX,
  y,
  size: 14,
  font: letterBold,
});

letterPage.drawLine({
  start: { x: subjectX, y: y - 2 },
  end: { x: subjectX + subjectWidth, y: y - 2 },
  thickness: 1,
});

y -= 30;

/* BODY */
y = drawWrapped(
  `We refer to your recent application for membership of this Institute and we are glad to inform you that the Management has approved your election as an ${app.approvedMembershipType.toUpperCase()} with effect from ${formattedDate}.`,
  70,
  y
);

y = drawWrapped(
  `Your membership number is ${certId} which should be quoted in all correspondence with the Institute. In accordance with provision of the Institute's enabling laws, rules and regulations, approved members in your category are eligible to pay the sum of N${total.toLocaleString()}.00 only the breakdown is as follows:`,
  70,
  y
);

/* TABLE */
const labelX = 150;
const amountRightEdge = pageWidth - 80;

const rows = [
  ["Induction Fees", fee.induction],
  ["Annual Subscription", fee.annual],
  ["Pre-Induction Training Fee", fee.training],
  ["Total", total],
];

rows.forEach(([label, amount]) => {
  letterPage.drawText(label, { x: labelX, y, size: 11, font: letterFont });

  const amountText = `N${amount.toLocaleString()}.00`;
  const width = letterBold.widthOfTextAtSize(amountText, 11);

  letterPage.drawText(amountText, {
    x: amountRightEdge - width,
    y,
    size: 11,
    font: letterBold,
  });

  y -= 18;
});

y -= 20;

y = drawWrapped(
  `Kindly make payment into the Institute's UBA Account No: 1013635573.`,
  70,
  y
);

y = drawWrapped(
  `Also be informed that your Annual Subscription becomes due for payment by January 31st each year and you are entitled to the following privileges as stated`,
  70,
  y
);

const privileges = [
  "1. Professional Training Special Courses and Conferences at reduced cost.",
  "2. Membership of branch of the Institute in your locality.",
  "3. Regular supply of the Institute magazines and newsletter.",
  `4. The use of the acronym "${acronym}" after your name`,
];

privileges.forEach((p) => {
  y = drawWrapped(p, 90, y);
});

y = drawWrapped(
  `Your election will remain valid ninety (90) days after which will be nullified if not formalized by payment of your dues as specified above. Please note that you are required to attend the Institute's pre-induction training and induction ceremony which is compulsory for every inductee. Also note that this admission letter is provisional and would be withdrawn and your membership cancelled if any irregularity is discovered in your credentials.`,
  70,
  y
);

y = drawWrapped(
  `While waiting to see you at the induction ceremony accept my congratulations!`,
  70,
  y
);

/* ================= CLOSING ================= */

if (y < 180) y = 180;

y -= 20;

letterPage.drawText("Yours faithfully,", {
  x: 70,
  y,
  size: 11,
  font: letterFont,
});

y -= 25;

letterPage.drawText(
  "For: Emergency, Crisis & Disaster Risk Management Institute",
  { x: 70, y, size: 11, font: letterFont }
);

y -= 35;

const sigPath = path.join(
  process.cwd(),
  "public/certificates/signature.jpg"
);

if (fs.existsSync(sigPath)) {
  const signatureBytes = fs.readFileSync(sigPath);
  const signatureImg = await letterPdf.embedJpg(signatureBytes);

  letterPage.drawImage(signatureImg, {
    x: 70,
    y: y - 40,
    width: 120,
    height: 50,
  });

  y -= 60;
}

letterPage.drawText("Priscilla Johnson", {
  x: 70,
  y,
  size: 12,
  font: letterBold,
});

y -= 18;

letterPage.drawText("Membership Service Officer", {
  x: 70,
  y,
  size: 11,
  font: letterFont,
});

y -= 18;

letterPage.drawText("08113907191", {
  x: 70,
  y,
  size: 11,
  font: letterFont,
});

y -= 18;

letterPage.drawText("registrarecrmi@yahoo.com", {
  x: 70,
  y,
  size: 11,
  font: letterFont,
});

  fs.writeFileSync(letterPath, await letterPdf.save());

  app.certificateId = certId;
  app.certificateUrl = `/certificates/generated/${certId}.pdf`;
  app.letterUrl = `/certificates/generated/${certId}-letter.pdf`;
  app.reviewedAt = issuedAt;

  await app.save();

  return NextResponse.json({ success: true });
}