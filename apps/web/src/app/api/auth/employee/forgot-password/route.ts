import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import {
  fetchEmployeeByIdentifier,
  patchEmployee,
} from "@/lib/employee-auth";
import { generateOtp, otpExpiresAt } from "@/lib/password-reset-otp";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetOtpEmail,
} from "@/lib/password-reset-email";

type Body = { identifier?: string; email?: string };

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

  const identifier = String(parsed.identifier ?? parsed.email ?? "").trim();
  if (!identifier) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const generic = {
    ok: true,
    message: "If that employee account exists, a 6-digit code has been sent to your email.",
  };

  let employee = null;
  try {
    employee = await fetchEmployeeByIdentifier(identifier);
  } catch {
    return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });
  }

  if (!employee) {
    return NextResponse.json(generic);
  }

  const otp = generateOtp();
  const expires = otpExpiresAt();
  const saved = await patchEmployee(employee.id, {
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
        resetPath: `/login/employee/reset?identifier=${encodeURIComponent(employee.employee_id)}`,
      });
    }
    return NextResponse.json({ ok: false, error: "email_not_configured" }, { status: 503 });
  }

  const sent = await sendPasswordResetOtpEmail({
    to: employee.email,
    otp,
    portalLabel: "Employee portal",
  });
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
  }

  return NextResponse.json({
    ...generic,
    resetPath: `/login/employee/reset?identifier=${encodeURIComponent(employee.employee_id)}`,
  });
}
