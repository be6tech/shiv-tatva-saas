import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { ensureEmployeeRow } from "@/lib/employee-auth";

type Body = { employeeId?: string; email?: string };

export async function POST(req: Request) {
  const admin = await verifyAdminBearer(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let parsed: Body;
  try {
    parsed = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const employeeId = String(parsed.employeeId ?? "")
    .trim()
    .toUpperCase();
  const email = String(parsed.email ?? "")
    .trim()
    .toLowerCase();

  if (employeeId.length < 3 || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const row = await ensureEmployeeRow(employeeId, email);
  if (!row) {
    return NextResponse.json(
      {
        ok: false,
        error: "login_save_failed",
        hint: "Set SUPABASE_SERVICE_ROLE_KEY and run supabase/employee_users.sql if needed.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    employeeId: row.employee_id,
    email: row.email,
    message: "Employee login created. Share the temporary password securely and ask them to reset it on first sign-in.",
  });
}
