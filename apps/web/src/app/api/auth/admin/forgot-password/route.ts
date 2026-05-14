import { NextResponse } from "next/server";
import {
  fetchAdminByEmail,
  getSupabaseAdminConfig,
  newResetToken,
  patchAdmin,
} from "@/lib/admin-auth";

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

  const admin = await fetchAdminByEmail(email);
  if (!admin) {
    // Same response shape whether or not the email exists (avoid account enumeration).
    return NextResponse.json({
      ok: true,
      message: "If that admin account exists, a reset link has been created.",
    });
  }

  const token = newResetToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const saved = await patchAdmin(admin.id, {
    reset_token: token,
    reset_token_expires_at: expires,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    message: "Reset link created. It is valid for 1 hour.",
    resetPath: `/login/admin/reset?token=${token}`,
  });
}
