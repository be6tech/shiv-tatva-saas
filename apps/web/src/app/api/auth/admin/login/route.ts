import { NextResponse } from "next/server";
import {
  ADMIN_EMAIL_DEFAULT,
  fetchAdminByEmail,
  getSupabaseAdminConfig,
  signAdminToken,
  verifyPassword,
} from "@/lib/admin-auth";

type Body = { identifier?: string; email?: string; password?: string };

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

  const email = String(parsed.identifier ?? parsed.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(parsed.password ?? "");

  if (!email.includes("@") || password.length < 1) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 400 });
  }

  const admin = await fetchAdminByEmail(email);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const token = await signAdminToken(admin.email);
  return NextResponse.json({
    token,
    user: { id: admin.email, role: "admin" as const },
    email: admin.email,
    hint: email === ADMIN_EMAIL_DEFAULT ? undefined : undefined,
  });
}
