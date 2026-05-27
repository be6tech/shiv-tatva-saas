import { NextResponse } from "next/server";
import { getSupabaseAdminConfig, hashPassword } from "@/lib/admin-auth";
import {
  fetchEmployeeByIdentifier,
  fetchEmployeeByResetToken,
  patchEmployee,
} from "@/lib/employee-auth";
import {
  isLegacyResetToken,
  isOtpExpired,
  verifyOtpCode,
} from "@/lib/password-reset-otp";

type Body = {
  token?: string;
  identifier?: string;
  email?: string;
  otp?: string;
  password?: string;
};

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

  const password = String(parsed.password ?? "");
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const token = String(parsed.token ?? "").trim();
  const otp = String(parsed.otp ?? "").replace(/\D/g, "");
  const identifier = String(parsed.identifier ?? parsed.email ?? "").trim();

  if (token && isLegacyResetToken(token)) {
    const employee = await fetchEmployeeByResetToken(token);
    if (!employee?.reset_token_expires_at) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
    }
    if (isOtpExpired(employee.reset_token_expires_at)) {
      return NextResponse.json({ ok: false, error: "token_expired" }, { status: 400 });
    }
    const saved = await patchEmployee(employee.id, {
      password_hash: hashPassword(password),
      reset_token: null,
      reset_token_expires_at: null,
    });
    if (!saved) {
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!identifier || otp.length !== 6) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const employee = await fetchEmployeeByIdentifier(identifier);
  if (!employee?.reset_token || !employee.reset_token_expires_at) {
    return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 });
  }
  if (isOtpExpired(employee.reset_token_expires_at)) {
    return NextResponse.json({ ok: false, error: "otp_expired" }, { status: 400 });
  }
  if (!verifyOtpCode(otp, employee.reset_token)) {
    return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 });
  }

  const saved = await patchEmployee(employee.id, {
    password_hash: hashPassword(password),
    reset_token: null,
    reset_token_expires_at: null,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
