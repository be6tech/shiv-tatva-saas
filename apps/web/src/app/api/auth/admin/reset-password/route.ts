import { NextResponse } from "next/server";
import {
  fetchAdminByEmail,
  fetchAdminByResetToken,
  getSupabaseAdminConfig,
  hashPassword,
  patchAdmin,
} from "@/lib/admin-auth";
import {
  isLegacyResetToken,
  isOtpExpired,
  verifyOtpCode,
} from "@/lib/password-reset-otp";

type Body = {
  token?: string;
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
  const email = String(parsed.email ?? "")
    .trim()
    .toLowerCase();

  if (token && isLegacyResetToken(token)) {
    const admin = await fetchAdminByResetToken(token);
    if (!admin?.reset_token_expires_at) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
    }
    if (isOtpExpired(admin.reset_token_expires_at)) {
      return NextResponse.json({ ok: false, error: "token_expired" }, { status: 400 });
    }
    const saved = await patchAdmin(admin.id, {
      password_hash: hashPassword(password),
      reset_token: null,
      reset_token_expires_at: null,
    });
    if (!saved) {
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!email.includes("@") || otp.length !== 6) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const admin = await fetchAdminByEmail(email);
  if (!admin?.reset_token || !admin.reset_token_expires_at) {
    return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 });
  }
  if (isOtpExpired(admin.reset_token_expires_at)) {
    return NextResponse.json({ ok: false, error: "otp_expired" }, { status: 400 });
  }
  if (!verifyOtpCode(otp, admin.reset_token)) {
    return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 });
  }

  const saved = await patchAdmin(admin.id, {
    password_hash: hashPassword(password),
    reset_token: null,
    reset_token_expires_at: null,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
