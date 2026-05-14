import { NextResponse } from "next/server";
import { authenticateEmployee, signEmployeeToken } from "@/lib/employee-auth";

type Body = { identifier?: string; password?: string };

export async function POST(req: Request) {
  let parsed: Body;
  try {
    parsed = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const identifier = String(parsed.identifier ?? "").trim();
  const password = String(parsed.password ?? "");

  if (!identifier || password.length < 1) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 400 });
  }

  try {
    const result = await authenticateEmployee(identifier, password);
    if ("error" in result) {
      const status = result.error === "invalid_credentials" ? 401 : 503;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }

    const token = await signEmployeeToken(result.employeeId);
    return NextResponse.json({
      token,
      user: { id: result.employeeId, role: "employee" as const },
      employeeId: result.employeeId,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
