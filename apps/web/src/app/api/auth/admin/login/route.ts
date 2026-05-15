import { NextResponse } from "next/server";
import { attachSessionCookie } from "@/lib/auth-cookie";
import { authenticateAdmin, signAdminToken } from "@/lib/admin-auth";

type Body = { identifier?: string; email?: string; password?: string };

export async function POST(req: Request) {
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

  try {
    const result = await authenticateAdmin(email, password);
    if ("error" in result) {
      const status =
        result.error === "invalid_credentials" ? 401 : result.error === "not_configured" ? 503 : 503;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }

    const token = await signAdminToken(result.email);
    const res = NextResponse.json({
      ok: true,
      user: { id: result.email, role: "admin" as const },
      email: result.email,
    });
    attachSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
