import "server-only";
import nodemailer from "nodemailer";

export type SendOtpResult =
  | { ok: true; sentTo: string; testInbox?: boolean }
  | { ok: false; error: string; code?: string };

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

function resolveRecipient(intended: string): { to: string; testInbox: boolean } {
  const testInbox = process.env.RESEND_TEST_INBOX?.trim().toLowerCase();
  if (testInbox && testInbox.includes("@")) {
    return { to: testInbox, testInbox: true };
  }
  return { to: intended, testInbox: false };
}

function parseResendError(body: string): { code?: string; message: string } {
  try {
    const data = JSON.parse(body) as { message?: string; statusCode?: number };
    const msg = data.message ?? body;
    if (msg.includes("verify a domain") || msg.includes("testing emails to your own email")) {
      return {
        code: "resend_domain_required",
        message:
          "Resend test mode only sends to your Resend account email. Verify a domain at resend.com/domains, or set RESEND_TEST_INBOX to your email for testing.",
      };
    }
    return { message: msg };
  } catch {
    return { message: body };
  }
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
    const parsed = parseResendError(body || `resend_${res.status}`);
    return { ok: false, error: parsed.message, code: parsed.code };
  }
  return { ok: true, sentTo: to };
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
  return { ok: true, sentTo: to };
}

export async function sendPasswordResetOtpEmail(params: {
  to: string;
  otp: string;
  portalLabel: string;
}): Promise<SendOtpResult> {
  const { otp, portalLabel } = params;
  const { to, testInbox } = resolveRecipient(params.to);
  const subject = `${portalLabel} — password reset code`;
  const lines = [
    `Your Shiv Tatva ${portalLabel} password reset code is:`,
    "",
    otp,
    "",
    "This code is valid for 15 minutes. If you did not request a reset, ignore this email.",
  ];
  if (testInbox && to.toLowerCase() !== params.to.toLowerCase()) {
    lines.push(
      "",
      `(Test mode: OTP for ${params.to} was sent to this inbox. Remove RESEND_TEST_INBOX after verifying your domain on Resend.)`
    );
  }
  const text = lines.join("\n");

  try {
    if (resendConfigured()) {
      const result = await sendViaResend(to, subject, text);
      if (result.ok) return { ...result, testInbox };
      return result;
    }
    if (smtpConfigured()) {
      const result = await sendViaSmtp(to, subject, text);
      if (result.ok) return { ...result, testInbox };
      return result;
    }
    return { ok: false, error: "email_not_configured" };
  } catch {
    return { ok: false, error: "email_send_failed" };
  }
}
