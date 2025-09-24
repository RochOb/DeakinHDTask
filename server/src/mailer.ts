// server/src/mailer.ts
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("SMTP_USER or SMTP_PASS not set. Mailer will fail until configured.");
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for TLS (587)
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  tls: { rejectUnauthorized: false },
});

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  const { to, subject, text, html } = opts;
  const message = {
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(message);
  return info; // info.messageId etc
}
