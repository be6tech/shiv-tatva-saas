import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  portfolio?: string | null;
  message?: string;
  application_id?: string | null;
};

/** Forwards career applications to Google Apps Script → Careers sheet tab. */
export async function POST(req: Request) {
  const webapp = process.env.GOOGLE_CAREERS_SHEET_WEBAPP_URL?.trim();
  if (!webapp) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let parsed: Body;
  try {
    parsed = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = String(parsed.name ?? "").trim();
  const email = String(parsed.email ?? "").trim();
  const message = String(parsed.message ?? "").trim();
  const role = String(parsed.role ?? "").trim();
  const phone = parsed.phone != null ? String(parsed.phone).trim() || "" : "";
  const portfolio = parsed.portfolio != null ? String(parsed.portfolio).trim() || "" : "";
  const application_id =
    parsed.application_id != null ? String(parsed.application_id).trim() || "" : "";

  if (name.length < 2 || !email.includes("@") || role.length < 2 || message.length < 10) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const body = JSON.stringify({
    name,
    email,
    phone,
    role,
    portfolio,
    message,
    application_id,
  });

  try {
    const res = await fetch(webapp, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "google_webapp", status: res.status, detail: text.slice(0, 300) },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, google: text.slice(0, 200) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "fetch_failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
