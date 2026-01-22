import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.EMAIL_PASSWORD) {
    console.warn("⚠ Email skipped: EMAIL_PASSWORD not set");
    return null;
  }

  return nodemailer.createTransport({
    host: "mail.ecrmi.org.ng",
    port: 587,
    secure: false,
    auth: {
      user: "training@ecrmi.org.ng",
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

export async function sendCertificateEmail({
  to,
  name,
  certificateUrl,
}: {
  to: string;
  name: string;
  certificateUrl: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"ECRMI Training" <training@ecrmi.org.ng>`,
    to,
    subject: "Your ECRMI Certificate",
    html: `
      <p>Dear ${name},</p>
      <p>Congratulations on completing your training.</p>
      <p>
        <a href="${certificateUrl}">
          Verify your certificate
        </a>
      </p>
      <p>ECRMI</p>
    `,
  });
}

export async function sendAnalyticsEmail({
  to,
  total,
  passed,
  passRate,
}: {
  to: string;
  total: number;
  passed: number;
  passRate: number;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"ECRMI Training" <training@ecrmi.org.ng>`,
    to,
    subject: "📊 Training Platform Analytics",
    html: `
      <h2>Analytics Summary</h2>
      <p>Total Attempts: <strong>${total}</strong></p>
      <p>Passed: <strong>${passed}</strong></p>
      <p>Pass Rate: <strong>${passRate}%</strong></p>
    `,
  });
}