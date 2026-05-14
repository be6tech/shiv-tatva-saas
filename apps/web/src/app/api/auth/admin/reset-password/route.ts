import { NextResponse } from "next/server";
import {
  fetchAdminByEmail,
  getSupabaseAdminConfig,
  hashPassword,
  patchAdmin,
} from "@/lib/admin-auth";

type Body = { email?: string; otp?: string; token?: string; password?: string };

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
  const otp = String(parsed.otp ?? parsed.token ?? "").trim();
  const password = String(parsed.password ?? "");

  if (!email.includes("@") || otp.length < 6 || password.length < 8) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const admin = await fetchAdminByEmail(email);
  if (!admin?.reset_token || !admin.reset_token_expires_at) {
    return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 });
  }

  if (new Date(admin.reset_token_expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "otp_expired" }, { status: 400 });
  }

  if (admin.reset_token !== otp) {
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
