
import nodemailer from "nodemailer";

type MailOpts = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || "no-reply@example.com";

let transporter: nodemailer.Transporter;

async function createTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    
    console.warn("SMTP creds not set — falling back to Ethereal test account for local testing.");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log("Ethereal test account created:", testAccount.user);
    return;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });

  
  try {
    await transporter.verify();
    console.log("SMTP transporter verified: able to connect/authenticate");
  } catch (err: any) {
    console.error("SMTP transporter verify failed:", err && err.message ? err.message : err);
  }
}

await createTransporter();

export async function sendEmail(opts: MailOpts) {
  const mail = {
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html
  };

  console.log("sendEmail: attempt", { to: opts.to, subject: opts.subject, from: FROM_EMAIL });

  try {
    const info = await transporter.sendMail(mail);
    console.log("sendEmail: result", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });

    
    if ((info as any).messageId && (info as any).envelope && (nodemailer.getTestMessageUrl as any)) {
      try {
        
        const url = (nodemailer as any).getTestMessageUrl(info as any);
        if (url) console.log("Preview URL (Ethereal):", url);
      } catch (_) { /* ignore */ }
    }

    return info;
  } catch (err: any) {
    console.error("sendEmail: error", err && err.message ? err.message : err);
    throw err;
  }
}
