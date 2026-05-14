import "server-only";
import nodemailer from "nodemailer";

export type SendOtpResult = { ok: true } | { ok: false; error: string };

function resendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

function smtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  );
}

export function isPasswordResetEmailConfigured(): boolean {
  return resendConfigured() || smtpConfigured();
}

async function sendViaResend(to: string, subject: string, text: string): Promise<SendOtpResult> {
  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from =
    process.env.PASSWORD_RESET_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    "Shiv Tatva <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: body || `resend_${res.status}` };
  }
  return { ok: true };
}

async function sendViaSmtp(to: string, subject: string, text: string): Promise<SendOtpResult> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const from =
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.PASSWORD_RESET_FROM_EMAIL?.trim() ||
    user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, text });
  return { ok: true };
}

export async function sendPasswordResetOtpEmail(params: {
  to: string;
  otp: string;
  portalLabel: string;
}): Promise<SendOtpResult> {
  const { to, otp, portalLabel } = params;
  const subject = `${portalLabel} — password reset code`;
  const text = [
    `Your Shiv Tatva ${portalLabel} password reset code is:`,
    "",
    otp,
    "",
    "This code is valid for 15 minutes. If you did not request a reset, ignore this email.",
  ].join("\n");

  try {
    if (resendConfigured()) {
      return await sendViaResend(to, subject, text);
    }
    if (smtpConfigured()) {
      return await sendViaSmtp(to, subject, text);
    }
    return { ok: false, error: "email_not_configured" };
  } catch {
    return { ok: false, error: "email_send_failed" };
  }
}
