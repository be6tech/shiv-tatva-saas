import { NextResponse } from "next/server";
import {
  fetchAdminByEmail,
  getSupabaseAdminConfig,
  patchAdmin,
} from "@/lib/admin-auth";
import { generateOtp, otpExpiresAt } from "@/lib/password-reset-otp";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetOtpEmail,
} from "@/lib/password-reset-email";

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
    message: "If that admin account exists, a 6-digit code has been sent to your email.",
  };

  const admin = await fetchAdminByEmail(email);
  if (!admin) {
    return NextResponse.json(generic);
  }

  const otp = generateOtp();
  const expires = otpExpiresAt();
  const saved = await patchAdmin(admin.id, {
    reset_token: otp,
    reset_token_expires_at: expires,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  if (!isPasswordResetEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ...generic,
        message: "Email is not configured. Use this OTP in dev:",
        devOtp: otp,
        resetPath: `/login/admin/reset?email=${encodeURIComponent(email)}`,
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: "email_not_configured",
        hint: "Add RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL on Vercel, then redeploy.",
      },
      { status: 503 }
    );
  }

  const sent = await sendPasswordResetOtpEmail({
    to: admin.email,
    otp,
    portalLabel: "Admin login",
  });
  if (!sent.ok) {
    return NextResponse.json(
      { ok: false, error: "email_send_failed", detail: sent.error },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ...generic,
    resetPath: `/login/admin/reset?email=${encodeURIComponent(email)}`,
  });
}
