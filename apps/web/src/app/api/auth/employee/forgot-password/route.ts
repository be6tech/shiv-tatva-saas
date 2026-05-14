import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import { findRosterEmployee } from "@/lib/employee-auth-constants";
import {
  fetchEmployeeByIdentifier,
  patchEmployee,
} from "@/lib/employee-auth";
import { generateOtp, otpExpiresAt } from "@/lib/password-reset-otp";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetOtpEmail,
} from "@/lib/password-reset-email";
import { putDevResetOtp } from "@/lib/password-reset-dev-store";

type Body = { identifier?: string; email?: string };

export async function POST(req: Request) {
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
  let employee: { id: string; employee_id: string; email: string } | null = null;
  let supabaseUnavailable = false;

  if (getSupabaseAdminConfig()) {
    try {
      const row = await fetchEmployeeByIdentifier(identifier);
      if (row) {
        employee = {
          id: row.id,
          employee_id: row.employee_id,
          email: row.email,
        };
      }
    } catch {
      supabaseUnavailable = true;
    }
  } else {
    supabaseUnavailable = true;
  }

  if (!employee && roster) {
    if (process.env.NODE_ENV === "development" || supabaseUnavailable) {
      employee = {
        id: `roster:${roster.id}`,
        employee_id: roster.id,
        email: roster.email,
      };
    }
  }

  if (!employee) {
    return NextResponse.json(generic);
  }

  const otp = generateOtp();
  const expires = otpExpiresAt();
  let saved = false;

  if (!employee.id.startsWith("roster:") && getSupabaseAdminConfig()) {
    saved = await patchEmployee(employee.id, {
      reset_token: otp,
      reset_token_expires_at: expires,
    });
  }

  if (!saved && process.env.NODE_ENV === "development") {
    putDevResetOtp(identifier, employee.employee_id, employee.email, otp, expires);
    saved = true;
  }

  if (!saved) {
    return NextResponse.json(
      {
        ok: false,
        error: "save_failed",
        hint: "Run supabase/employee_users.sql in Supabase SQL Editor.",
      },
      { status: 502 }
    );
  }

  const resetPath = `/login/employee/reset?identifier=${encodeURIComponent(employee.employee_id)}`;

  if (!isPasswordResetEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ok: true,
        message: `OTP created for ${employee.email}. Add RESEND_API_KEY to email it, or use this dev code:`,
        devOtp: otp,
        resetPath,
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
    return NextResponse.json(
      { ok: false, error: "email_send_failed", detail: sent.error },
      { status: 502 }
    );
  }

  return NextResponse.json({ ...generic, resetPath });
}
