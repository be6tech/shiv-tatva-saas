import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import { findRosterEmployee } from "@/lib/employee-auth-constants";
import { saveEmployeeResetOtp } from "@/lib/employee-auth";
import { generateOtp, otpExpiresAt } from "@/lib/password-reset-otp";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetOtpEmail,
} from "@/lib/password-reset-email";
import { putDevResetOtp } from "@/lib/password-reset-dev-store";

type Body = { identifier?: string; email?: string };

export async function POST(req: Request) {
  if (!getSupabaseAdminConfig()) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        hint: "Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL on Vercel.",
      },
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
    message: "If that employee account exists, a 6-digit code has been sent to your email.",
  };

  const roster = findRosterEmployee(identifier);
  if (!roster) {
    return NextResponse.json(generic);
  }

  const otp = generateOtp();
  const expires = otpExpiresAt();
  const resetPath = `/login/employee/reset?identifier=${encodeURIComponent(roster.id)}`;

  let savedRow = null;
  try {
    savedRow = await saveEmployeeResetOtp(roster.id, roster.email, otp, expires);
  } catch {
    if (process.env.NODE_ENV === "development") {
      putDevResetOtp(identifier, roster.id, roster.email, otp, expires);
      return NextResponse.json({
        ok: true,
        message: `OTP created for ${roster.email}. Add RESEND_API_KEY to email it, or use this dev code:`,
        devOtp: otp,
        resetPath,
      });
    }
    return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });
  }

  if (!savedRow) {
    if (process.env.NODE_ENV === "development") {
      putDevResetOtp(identifier, roster.id, roster.email, otp, expires);
      return NextResponse.json({
        ok: true,
        message: `OTP created for ${roster.email}. Run employee_users.sql or use dev code:`,
        devOtp: otp,
        resetPath,
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: "save_failed",
        hint: "Run apps/web/supabase/employee_users.sql in Supabase SQL Editor, then retry.",
      },
      { status: 502 }
    );
  }

  if (!isPasswordResetEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ok: true,
        message: `OTP created for ${roster.email}. Add RESEND_API_KEY to email it, or use this dev code:`,
        devOtp: otp,
        resetPath,
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
    to: roster.email,
    otp,
    portalLabel: "Employee portal",
  });
  if (!sent.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: sent.code ?? "email_send_failed",
        detail: sent.error,
        hint:
          sent.code === "resend_domain_required"
            ? "Verify be6technologies.in (or your domain) at resend.com/domains, or set RESEND_TEST_INBOX=ganeshbandaru800@gmail.com on Vercel for testing."
            : "Verify RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ...generic,
    resetPath,
    message: sent.testInbox
      ? `OTP sent to ${sent.sentTo} (test inbox). Code is for ${roster.email}.`
      : generic.message,
  });
}
