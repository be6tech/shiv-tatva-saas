import { NextResponse } from "next/server";
import {
  fetchAdminByEmail,
  getSupabaseAdminConfig,
  patchAdmin,
} from "@/lib/admin-auth";
import { maskEmail } from "@/lib/mask-email";
import {
  generateOtpCode,
  hashOtpCode,
  otpExpiresAt,
} from "@/lib/password-reset-otp";
import { sendPasswordResetOtpEmail } from "@/lib/send-password-reset-otp";

type Body = { email?: string };

export async function POST(req: Request) {
  if (!getSupabaseAdminConfig()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let parsed: Body;
  try {
    parsed = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = String(parsed.email ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const generic = {
    ok: true,
    message: "If that admin account exists, a one-time code was sent to the registered email.",
  };

  const admin = await fetchAdminByEmail(email);
  if (!admin) {
    return NextResponse.json(generic);
  }

  const otp = generateOtpCode();
  const otpHash = hashOtpCode(otp);
  const expires = otpExpiresAt();
  const saved = await patchAdmin(admin.id, {
    reset_token: otpHash,
    reset_token_expires_at: expires,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  const mail = await sendPasswordResetOtpEmail(admin.email, otp, "admin");

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
    maskedEmail: maskEmail(admin.email),
    ...(mail.devOtp ? { devOtp: mail.devOtp } : {}),
  });
}
