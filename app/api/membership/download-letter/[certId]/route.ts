export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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

function formatMoney(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


function getArticleForMembershipType(type: string) {
  const t = String(type || "").trim().toLowerCase();

  if (t.startsWith("honorary")) return "an";
  if (t.startsWith("affiliate")) return "an";
  if (t.startsWith("associate")) return "an";

  // fallback 
  const first = t[0] || "";
  return "aeiou".includes(first) ? "an" : "a";
}

/** Acronym is always prefix + ECRMI */
function getEcrmiAcronym(membershipType: string) {
  const t = String(membershipType || "").toLowerCase();

  if (t.includes("honorary")) return "HECRMI";
  if (t.includes("professional") && t.includes("fellow")) return "PFECRMI";
  if (t.includes("fellow")) return "FECRMI";
  if (t.includes("professional")) return "PMECRMI";
  if (t.includes("technical")) return "TECRMI";
  if (t.includes("graduate")) return "GECRMI";
  if (t.includes("affiliate")) return "AFECRMI";
  if (t.includes("associate")) return "AECRMI";

  return "ECRMI";
}

function numberToWords(n: number): string {
  const ones = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const toWordsBelow100 = (x: number) => {
    if (x < 20) return ones[x];
    const t = Math.floor(x / 10);
    const r = x % 10;
    return r ? `${tens[t]}-${ones[r]}` : tens[t];
  };

  const toWordsBelow1000 = (x: number) => {
    if (x < 100) return toWordsBelow100(x);
    const h = Math.floor(x / 100);
    const r = x % 100;
    return r
      ? `${ones[h]} Hundred and ${toWordsBelow100(r)}`
      : `${ones[h]} Hundred`;
  };

  if (n === 0) return "Zero";

  let words: string[] = [];
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const remainder = n % 1000;

  if (billions) words.push(`${toWordsBelow1000(billions)} Billion`);
  if (millions) words.push(`${toWordsBelow1000(millions)} Million`);
  if (thousands) words.push(`${toWordsBelow1000(thousands)} Thousand`);
  if (remainder) words.push(`${toWordsBelow1000(remainder)}`);

  return words.join(" ");
}

type FeeRow = { label: string; amount: number };

function getFeeRows(membershipType: string): FeeRow[] {
  const t = String(membershipType || "").toLowerCase();

  // same for Associate / Graduate / Affiliate
  if (t.includes("associate") || t.includes("graduate") || t.includes("affiliate")) {
    return [
      { label: "Induction Fees", amount: 50000 },
      { label: "Annual Subscription", amount: 15000 },
      { label: "Pre-Induction Training Fee", amount: 10000 },
    ];
  }

  if (t.includes("technical")) {
    return [
      { label: "Induction Fees", amount: 50000 },
      { label: "Annual Subscription", amount: 20000 },
      { label: "Pre-Induction Training Fee", amount: 20000 },
    ];
  }

  if (t.includes("professional") && !t.includes("fellow")) {
    return [
      { label: "Induction Fees", amount: 75000 },
      { label: "Annual Subscription", amount: 15000 },
      { label: "Pre-Induction Training Fee", amount: 10000 },
    ];
  }

  if (t.includes("fellow")) {
    return [
      { label: "Induction Fees", amount: 160000 },
      { label: "Annual Subscription", amount: 25000 },
    ];
  }


if (t.includes("honorary")) {
  return [
    { label: "Induction Fees", amount: 0 },
    { label: "Annual Subscription", amount: 0 },
    { label: "Documentation/Processing Fee", amount: 0 },
  ];
}
  return [];
}

function sumFees(rows: FeeRow[]) {
  return rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

type TextSeg = { text: string; bold?: boolean };

export async function GET(
  req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  await connectDB();
  const { certId } = await params;

  const app = await MembershipApplication.findOne({
    certificateId: certId,
    status: "approved",
  }).lean();

  if (!app) {
    return NextResponse.json({ error: "Letter not found" }, { status: 404 });
  }

  const membershipType =
    (app as any).approvedMembershipType ??
    (app as any).requestedMembershipType ??
    "";

  const article = getArticleForMembershipType(membershipType);
  const acronym = getEcrmiAcronym(membershipType);

  const issuedAtRaw =
    (app as any).reviewedAt ??
    (app as any).updatedAt ??
    (app as any).createdAt ??
    new Date();

  const issuedAt = new Date(issuedAtRaw);
  const formattedDate = formatDateWithOrdinal(issuedAt);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Fonts (custom if present, fallback otherwise)
  const regularFontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSans-Regular.ttf"
  );
  const boldFontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSans-Bold.ttf"
  );

  let font: any;
  let bold: any;

  if (fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath)) {
    font = await pdfDoc.embedFont(fs.readFileSync(regularFontPath));
    bold = await pdfDoc.embedFont(fs.readFileSync(boldFontPath));
  } else {
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  // Letterhead
  const letterBgPath = path.join(
    process.cwd(),
    "public",
    "certificates",
    "letters",
    "letterhead.jpeg"
  );

  if (!fs.existsSync(letterBgPath)) {
    return NextResponse.json(
      {
        error: "Letterhead not found",
        expectedPath: "public/certificates/letters/letterhead.jpeg",
      },
      { status: 500 }
    );
  }

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

  // Layout
  const BODY_SIZE = 11;
  const BODY_LINE = 14; // tighter spacing
  const LEFT = 70;
  const MAX_WIDTH = pageWidth - 140;

  function segFont(s: TextSeg) {
    return s.bold ? bold : font;
  }

  function drawWrappedSegs(
    segments: TextSeg[],
    x: number,
    y: number,
    size = BODY_SIZE
  ) {
    const tokens: { text: string; fontObj: any }[] = [];

    for (const seg of segments) {
      const f = segFont(seg);
      const parts = String(seg.text ?? "").split(" ");
      for (let i = 0; i < parts.length; i++) {
        const w = parts[i];
        if (!w) continue;
        tokens.push({ text: w, fontObj: f });
        tokens.push({ text: " ", fontObj: f });
      }
    }

    let line: { text: string; fontObj: any }[] = [];
    let lineWidth = 0;
    let currentY = y;

    const flush = () => {
      if (!line.length) return;
      let cursorX = x;

      for (const t of line) {
        if (!t.text) continue;
        page.drawText(t.text, {
          x: cursorX,
          y: currentY,
          size,
          font: t.fontObj,
        });
        cursorX += t.fontObj.widthOfTextAtSize(t.text, size);
      }

      currentY -= BODY_LINE;
      line = [];
      lineWidth = 0;
    };

    for (const tok of tokens) {
      const w = tok.fontObj.widthOfTextAtSize(tok.text, size);
      if (lineWidth + w > MAX_WIDTH && line.length > 0) flush();
      line.push(tok);
      lineWidth += w;
    }

    flush();
    return currentY - 2; // tiny paragraph gap
  }

  function drawWrappedText(text: string, x: number, y: number) {
    return drawWrappedSegs([{ text }], x, y);
  }

  function drawBreakdownTableCentered(rows: FeeRow[], y: number) {
    const tableWidth = 360;
    const xTable = (pageWidth - tableWidth) / 2;

    const labelX = xTable + 10;
    const amountX = xTable + tableWidth - 10;

    for (const r of rows) {
      page.drawText(r.label, { x: labelX, y, size: BODY_SIZE, font });
      const amt = formatMoney(r.amount);
      const amtW = font.widthOfTextAtSize(amt, BODY_SIZE);
      page.drawText(amt, { x: amountX - amtW, y, size: BODY_SIZE, font });
      y -= BODY_LINE;
    }

    const total = sumFees(rows);
    page.drawText("Total", { x: labelX, y, size: BODY_SIZE, font: bold });

    const totalText = formatMoney(total);
    const totalW = bold.widthOfTextAtSize(totalText, BODY_SIZE);
    page.drawText(totalText, {
      x: amountX - totalW,
      y,
      size: BODY_SIZE,
      font: bold,
    });

    return y - 28; // space after Total
  }

  // ---------- CONTENT ----------
  let y = pageHeight - 180;

  page.drawText(formattedDate, { x: LEFT, y, size: 12, font });
  y -= 18;

  page.drawText(String((app as any).fullName || ""), {
    x: LEFT,
    y,
    size: 12,
    font: bold,
  });
  y -= 22;

  page.drawText("Dear Sir/Madam,", { x: LEFT, y, size: 12, font });
  y -= 28;

  // Subject with correct article
  const subject = `ELECTION AS ${article.toUpperCase()} ${String(membershipType).toUpperCase()}`;
  const subjectSize = 14;
  const subjectW = bold.widthOfTextAtSize(subject, subjectSize);
  const subjectX = (pageWidth - subjectW) / 2;

  page.drawText(subject, { x: subjectX, y, size: subjectSize, font: bold });
  page.drawLine({
    start: { x: subjectX, y: y - 2 },
    end: { x: subjectX + subjectW, y: y - 2 },
    thickness: 1,
  });
  y -= 26;

  // Paragraph 1 (correct article + bold membership type)
  y = drawWrappedSegs(
    [
      {
        text:
          "We refer to your recent application for membership of this Institute and we are glad to inform you that the Management has approved your election as ",
      },
      { text: `${article} ` },
      { text: String(membershipType).toUpperCase(), bold: true },
      { text: ` with effect from ${formattedDate}.` },
    ],
    LEFT,
    y
  );

  const feeRows = getFeeRows(membershipType);
  const total = feeRows.length ? sumFees(feeRows) : 0;
  const totalWords = feeRows.length ? `${numberToWords(total)} Naira Only` : "";
  const totalNumeric = feeRows.length ? formatMoney(total) : "";

  // Merge membership number sentence + "In accordance..." in same block (space saving)
  y = drawWrappedSegs(
    feeRows.length
      ? [
          { text: "Your membership number is " },
          { text: String(certId), bold: true },
          { text: " which should be quoted in all correspondence with the Institute. " },
          {
            text:
              "In accordance with provision of the institute's enabling laws, rules and regulations, approved members in your category are eligible to pay the sum of ",
          },
          { text: `${totalWords} (${totalNumeric})`, bold: true },
          { text: " only. The breakdown is as follows:" },
        ]
      : [
          { text: "Your membership number is " },
          { text: String(certId), bold: true },
          { text: " which should be quoted in all correspondence with the Institute." },
        ],
    LEFT,
    y
  );

  if (feeRows.length) {
    // Breakdown table
    y = drawBreakdownTableCentered(feeRows, y);

    // Payment line first
    y = drawWrappedSegs(
      [
        { text: "Kindly make payment into the Institute's " },
        { text: "UBA Account No. 1013635573", bold: true },
        { text: "." },
      ],
      LEFT,
      y
    );

    // Annual subscription paragraph
    y = drawWrappedText(
      "Kindly be informed that your Annual Subscription becomes due for payment by January 31st each year and you are entitled to the following privileges as stated:",
      LEFT,
      y
    );

    // Privileges
    y = drawWrappedText(
      "1. Professional training special courses and conferences at reduced cost.",
      LEFT + 20,
      y
    );
    y = drawWrappedText(
      "2. Membership of branch of the Institute in your locality.",
      LEFT + 20,
      y
    );
    y = drawWrappedText(
      "3. Regular supply of the Institute magazines and newsletter.",
      LEFT + 20,
      y
    );
    y = drawWrappedSegs(
      [
        { text: '4. The use of the acronym "' },
        { text: acronym, bold: true },
        { text: '" after your name.' },
      ],
      LEFT + 20,
      y
    );

    // ✅ space between No.4 and next paragraph
    y -= 8;

    // Compliance paragraph
    y = drawWrappedText(
      "Your election will remain valid ninety (90) days after which will be nullified if not formalized by payment of your dues as specified above. Please note that you are required to attend the institute's pre-induction training and induction ceremony which is compulsory for every inductee. Also note that this admission letter is provisional and would be withdrawn and your membership cancelled if any irregularity is discovered in your credentials.",
      LEFT,
      y
    );

    // ✅ space between credentials paragraph and congratulations
    y -= 8;
  } else {
    // Honorary / no fees
    y = drawWrappedSegs(
      [
        { text: 'The use of the acronym "' },
        { text: acronym, bold: true },
        { text: '" after your name is hereby authorized.' },
      ],
      LEFT,
      y
    );

    y -= 8;
  }

  y = drawWrappedText(
    "While waiting to see you at the induction ceremony accept my congratulations!",
    LEFT,
    y
  );

  // ---------- FOOTER / SIGNATURE ----------
  y -= 14;

  // Keeps footer in a nice lower area if there is space,
  // but prevents it from dropping into the printed letterhead footer.
  const FOOTER_TARGET_Y = 190; // lower target (brings footer down)
  const FOOTER_MIN_Y = 120; // don't go into printed footer text

  y = Math.min(y, FOOTER_TARGET_Y);
  if (y < FOOTER_MIN_Y) y = FOOTER_MIN_Y;

  page.drawText("Yours faithfully,", { x: LEFT, y, size: 11, font });
  y -= 18;

  page.drawText("For: Emergency, Crisis & Disaster Risk Management Institute", {
    x: LEFT,
    y,
    size: 11,
    font: bold,
  });
  y -= 14;

  // Signature image (jpeg/jpg/png) - smaller
  const sigJpeg = path.join(process.cwd(), "public", "certificates", "signature.jpeg");
  const sigJpg = path.join(process.cwd(), "public", "certificates", "signature.jpg");
  const sigPng = path.join(process.cwd(), "public", "certificates", "signature.png");

  let sigBytes: Buffer | null = null;
  let sigType: "jpg" | "png" | null = null;

  if (fs.existsSync(sigJpeg)) {
    sigBytes = fs.readFileSync(sigJpeg);
    sigType = "jpg";
  } else if (fs.existsSync(sigJpg)) {
    sigBytes = fs.readFileSync(sigJpg);
    sigType = "jpg";
  } else if (fs.existsSync(sigPng)) {
    sigBytes = fs.readFileSync(sigPng);
    sigType = "png";
  }

  if (sigBytes && sigType) {
    const sigImg =
      sigType === "png" ? await pdfDoc.embedPng(sigBytes) : await pdfDoc.embedJpg(sigBytes);

    page.drawImage(sigImg, {
      x: LEFT,
      y: y - 42,
      width: 150,
      height: 45,
    });
  }

  y -= 54;

  page.drawText("Priscilla Johnson", { x: LEFT, y, size: 12, font: bold });
  y -= 14;

  page.drawText("Membership Service Officer", { x: LEFT, y, size: 11, font });
  y -= 12;

  page.drawText("08113907191", { x: LEFT, y, size: 11, font });
  y -= 12;

  page.drawText("Email: registrarecrmi@yahoo.com", { x: LEFT, y, size: 11, font });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  const { searchParams } = new URL(req.url);
  const preview = searchParams.get("preview") === "1";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview
        ? `inline; filename=letter-${certId}.pdf`
        : `attachment; filename=letter-${certId}.pdf`,
      "Cache-Control": "no-store",
    },
  });
}