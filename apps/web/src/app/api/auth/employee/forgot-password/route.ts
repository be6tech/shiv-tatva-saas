import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import { findRosterEmployee } from "@/lib/employee-auth-constants";
import { fetchEmployeeByIdentifier, saveEmployeeOtpReset } from "@/lib/employee-auth";
import { maskEmail } from "@/lib/mask-email";
import {
  generateOtpCode,
  hashOtpCode,
  otpExpiresAt,
} from "@/lib/password-reset-otp";
import { sendPasswordResetOtpEmail } from "@/lib/send-password-reset-otp";

type Body = { identifier?: string; email?: string };

export async function POST(req: Request) {
  if (!getSupabaseAdminConfig()) {
    return NextResponse.json(
      { ok: false, error: "not_configured", hint: "Set SUPABASE_SERVICE_ROLE_KEY on Vercel." },
      { status: 503 }
    );
  }

  let parsed: Body;
  try {
    parsed = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const identifier = String(parsed.identifier ?? parsed.email ?? "").trim();
  if (!identifier) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const generic = {
    ok: true,
    message: "If that employee account exists, a one-time code was sent to the registered email.",
  };

  const roster = findRosterEmployee(identifier);
  if (!roster) {
    return NextResponse.json(generic);
  }

  const otp = generateOtpCode();
  const otpHash = hashOtpCode(otp);
  const expires = otpExpiresAt();
  const saved = await saveEmployeeOtpReset(roster.id, roster.email, otpHash, expires);
  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "save_failed", hint: "Run supabase/employee_users.sql in Supabase." },
      { status: 502 }
    );
  }

  const employee = await fetchEmployeeByIdentifier(roster.id);
  const emailTo = employee?.email ?? roster.email;
  const mail = await sendPasswordResetOtpEmail(emailTo, otp, "employee");

  if (!mail.sent && !mail.devOtp) {
    return NextResponse.json(
      {
        ok: false,
        error: "email_failed",
        hint: "Set RESEND_API_KEY + RESEND_FROM_EMAIL, or GOOGLE_PASSWORD_RESET_OTP_WEBAPP_URL (see scripts/google-apps-script-password-reset-otp.gs).",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: mail.sent
      ? "A 6-digit code was sent to your email. Check inbox (and spam). It expires in 10 minutes."
      : "Email is not configured — use the dev OTP below, then reset your password.",
    maskedEmail: maskEmail(emailTo),
    ...(mail.devOtp ? { devOtp: mail.devOtp } : {}),
  });
}
