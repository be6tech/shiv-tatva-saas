import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import {
  fetchEmployeeByIdentifier,
  newResetToken,
  patchEmployee,
} from "@/lib/employee-auth";

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

  let employee = null;
  try {
    employee = await fetchEmployeeByIdentifier(identifier);
  } catch {
    return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });
  }

  if (!employee) {
    return NextResponse.json({
      ok: true,
      message: "If that employee account exists, a reset link has been created.",
    });
  }

  const token = newResetToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const saved = await patchEmployee(employee.id, {
    reset_token: token,
    reset_token_expires_at: expires,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    message: "Reset link created. It is valid for 1 hour.",
    resetPath: `/login/employee/reset?token=${token}`,
  });
}
