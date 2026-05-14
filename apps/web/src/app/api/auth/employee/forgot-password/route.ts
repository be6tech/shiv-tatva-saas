import { NextResponse } from "next/server";
import { getSupabaseAdminConfig, newResetToken } from "@/lib/admin-auth";
import { findRosterEmployee } from "@/lib/employee-auth-constants";
import { saveEmployeeResetToken } from "@/lib/employee-auth";

type Body = { identifier?: string; email?: string };

export async function POST(req: Request) {
  if (!getSupabaseAdminConfig()) {
    return NextResponse.json(
      { ok: false, error: "not_configured", hint: "Set SUPABASE_SERVICE_ROLE_KEY on Vercel." },
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
    message: "If that employee account exists, a reset link has been created.",
  };

  const roster = findRosterEmployee(identifier);
  if (!roster) {
    return NextResponse.json(generic);
  }

  const token = newResetToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const saved = await saveEmployeeResetToken(roster.id, roster.email, token, expires);
  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "save_failed", hint: "Run supabase/employee_users.sql in Supabase." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Reset link created. It is valid for 1 hour.",
    resetPath: `/login/employee/reset?token=${token}`,
  });
}
