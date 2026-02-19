export const runtime = "nodejs";

import { connectDB } from "@/lib/db";
import MembershipApplication from "@/models/MembershipApplication";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

type Layout = {
  page: { w: number; h: number };
  name: { y: number; size: number };
  membershipNo: { x: number; y: number; size: number };
  date?: { x: number; y: number; size: number };
  qr: { x: number; y: number; w: number; h: number };
};

function getTemplateFile(membershipType: string) {
  const t = String(membershipType || "").toLowerCase();
  
  if (t.includes("honorary")) return "honorary.jpeg";
  if (t.includes("professional") && (t.includes("fellowship") || t.includes("fellow"))) {
    return "professional-fellowship.jpeg";
  }
  if (t.includes("professional")) return "professional-membership.jpeg";
  if (t.includes("technical")) return "technical.jpeg";
  if (t.includes("associate")) return "associate.jpeg";
  if (t.includes("affiliate")) return "affiliate.jpeg";
  

  return "associate.jpeg";
}

function formatDateForCertificate(date: Date) {
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

  return `${day}${ordinal} of ${month} ${year}`;
}

const DEFAULT_LAYOUT: Layout = {
  page: { w: 842, h: 595 },
  name: { y: 700, size: 36 },
  membershipNo: { x: 235, y: 115, size: 11 },
  date: { x: 410, y: 295, size: 20 },
  qr: { x: 680, y: 70, w: 100, h: 100 },
};

const LAYOUTS: Record<string, Partial<Layout>> = {
  "associate.jpeg": {
    membershipNo: { x: 212, y: 174, size: 16 },
    date: { x: 460, y: 493, size: 17 },
    qr: { x: 590, y: 170, w: 100, h: 100 },
  },

  "affiliate.jpeg": {
    membershipNo: { x: 212, y: 185, size: 15 },
    date: { x: 460, y: 499, size: 17 },
    qr: { x: 590, y: 170, w: 100, h: 100 },
  },


  "technical.jpeg": {
    membershipNo: { x: 213, y: 197, size: 17 },
    date: { x: 460, y: 495, size: 18 },
    qr: { x: 590, y: 170, w: 100, h: 100 },
  },

  "professional-fellowship.jpeg": {
    membershipNo: { x: 215, y: 195, size: 15 },
    date: { x: 460, y: 492, size: 17 },
    qr: { x: 590, y: 170, w: 100, h: 100 },
  },

  "professional-membership.jpeg": {
    membershipNo: { x: 212, y: 183, size: 17 },
    date: { x: 470, y: 496, size: 17 },
    qr: { x: 590, y: 170, w: 100, h: 100 },
  },

  "honorary.jpeg": {
    membershipNo: { x: 212, y: 186, size: 17 },
    date: { x: 465, y: 494, size: 17 },
    qr: { x: 590, y: 170, w: 100, h: 100 },
  },
};

function mergeLayout(templateFile: string): Layout {
  const override = LAYOUTS[templateFile] || {};
  return {
    page: override.page ?? DEFAULT_LAYOUT.page,
    name: override.name ?? DEFAULT_LAYOUT.name,
    membershipNo: override.membershipNo ?? DEFAULT_LAYOUT.membershipNo,
    date: override.date ?? DEFAULT_LAYOUT.date,
    qr: override.qr ?? DEFAULT_LAYOUT.qr,
  };
}

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
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const membershipType =
    app.approvedMembershipType ?? app.requestedMembershipType ?? "";

  const templateFile = getTemplateFile(membershipType);
  const layout = mergeLayout(templateFile);

  // ✅ Query params for preview/tuning (no downloads needed)
  const { searchParams } = new URL(req.url);

  const preview = searchParams.get("preview") === "1"; // inline open in browser

  // live tuning (no code edits while testing)
  const memX = searchParams.get("memX");
  const memY = searchParams.get("memY");
  const dateX = searchParams.get("dateX");
  const dateY = searchParams.get("dateY");

  // ✅ QR live tuning
  const qrX = searchParams.get("qrX");
  const qrY = searchParams.get("qrY");
  const qrW = searchParams.get("qrW");
  const qrH = searchParams.get("qrH");

  if (memX !== null) layout.membershipNo.x = Number(memX);
  if (memY !== null) layout.membershipNo.y = Number(memY);

  if (layout.date) {
    if (dateX !== null) layout.date.x = Number(dateX);
    if (dateY !== null) layout.date.y = Number(dateY);
  }

  if (qrX !== null) layout.qr.x = Number(qrX);
  if (qrY !== null) layout.qr.y = Number(qrY);
  if (qrW !== null) layout.qr.w = Number(qrW);
  if (qrH !== null) layout.qr.h = Number(qrH);

  const templatePath = path.join(
    process.cwd(),
    "public",
    "certificates",
    "templates",
    templateFile
  );

  if (!fs.existsSync(templatePath)) {
    return NextResponse.json(
      {
        error: `Template not found: ${templateFile}`,
        expectedPath: `public/certificates/templates/${templateFile}`,
      },
      { status: 500 }
    );
  }

  const issuedAt = app.reviewedAt ?? app.updatedAt ?? app.createdAt ?? new Date();
  const issuedText = formatDateForCertificate(new Date(issuedAt));

   const pdfDoc = await PDFDocument.create();
   pdfDoc.registerFontkit(fontkit);

const serifBytes = fs.readFileSync(
  path.join(process.cwd(), "public", "fonts", "Tinos-Regular.ttf")
);
const sansBoldBytes = fs.readFileSync(
  path.join(process.cwd(), "public", "fonts", "LiberationSans-Bold.ttf")
);

const serif = await pdfDoc.embedFont(serifBytes);
const sansBold = await pdfDoc.embedFont(sansBoldBytes);


   const templateBytes = fs.readFileSync(templatePath);
   const template = await pdfDoc.embedJpg(templateBytes);


   const page = pdfDoc.addPage([template.width, template.height]);


   layout.page.w = template.width;
   layout.page.h = template.height;

   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
   const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

   page.drawImage(template, {
   x: 0,
   y: 0,
   width: template.width,
   height: template.height,
  });

  // Name (centered)
  const name = String(app.fullName || "").trim();
  const nameWidth = bold.widthOfTextAtSize(name, layout.name.size);

  page.drawText(name, {
    x: (layout.page.w - nameWidth) / 2,
    y: layout.name.y,
    size: layout.name.size,
    font: bold,
  });

  // Membership number
  page.drawText(String(certId), {
    x: layout.membershipNo.x,
    y: layout.membershipNo.y,
    size: layout.membershipNo.size,
    font: bold,
  });

  // Date (optional)
  if (layout.date) {
    page.drawText(issuedText, {
      x: layout.date.x,
      y: layout.date.y,
      size: layout.date.size,
      font,
    });
  }


  // QR Code
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const qrDataUrl = await QRCode.toDataURL(
    `${baseUrl}/membership/verify/${encodeURIComponent(String(certId))}`
  );

  const qrImage = await pdfDoc.embedPng(
    Buffer.from(qrDataUrl.split(",")[1], "base64")
  );

  page.drawImage(qrImage, {
    x: layout.qr.x,
    y: layout.qr.y,
    width: layout.qr.w,
    height: layout.qr.h,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview
        ? `inline; filename=certificate-${certId}.pdf`
        : `attachment; filename=certificate-${certId}.pdf`,
      "Cache-Control": "no-store",
    },
  });
}