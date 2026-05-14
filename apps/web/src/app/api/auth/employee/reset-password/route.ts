import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import {
  fetchEmployeeByIdentifier,
  hashPassword,
  patchEmployee,
} from "@/lib/employee-auth";
import { verifyDevResetOtp } from "@/lib/password-reset-dev-store";

type Body = { identifier?: string; email?: string; otp?: string; token?: string; password?: string };

export async function POST(req: Request) {
  let parsed: Body;
  try {
    parsed = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const identifier = String(parsed.identifier ?? parsed.email ?? "").trim();
  const otp = String(parsed.otp ?? parsed.token ?? "").trim();
  const password = String(parsed.password ?? "");

  if (!identifier || otp.length < 6 || password.length < 8) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const employee = await fetchEmployeeByIdentifier(identifier);

  if (employee?.reset_token && employee.reset_token_expires_at) {
    if (new Date(employee.reset_token_expires_at).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "otp_expired" }, { status: 400 });
    }
    if (employee.reset_token === otp) {
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
  }

  if (process.env.NODE_ENV === "development") {
    const dev = verifyDevResetOtp(identifier, otp);
    if (dev && getSupabaseAdminConfig()) {
      const row = await fetchEmployeeByIdentifier(dev.employeeId);
      if (row) {
        const saved = await patchEmployee(row.id, {
          password_hash: hashPassword(password),
          reset_token: null,
          reset_token_expires_at: null,
        });
        if (saved) return NextResponse.json({ ok: true });
      }
    }
    if (dev) {
      return NextResponse.json({
        ok: true,
        devOnly: true,
        message: "Password accepted in dev (Supabase unavailable). Use demo login or run employee_users.sql.",
      });
    }
  }

  return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 });
}
