import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  company?: string | null;
  phone?: string | null;
  message?: string;
  source?: string;
  lead_id?: string | null;
};

/**
 * Forwards contact/demo payloads to a Google Apps Script Web App URL
 * (see scripts/google-apps-script-contact-leads.gs). Server-only env.
 */
export async function POST(req: Request) {
  const webapp = process.env.GOOGLE_CONTACT_SHEET_WEBAPP_URL?.trim();
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
  const company = parsed.company != null ? String(parsed.company).trim() || "" : "";
  const phone = parsed.phone != null ? String(parsed.phone).trim() || "" : "";
  const source = String(parsed.source ?? "contact").trim() || "contact";
  const lead_id = parsed.lead_id != null ? String(parsed.lead_id).trim() || "" : "";

  if (name.length < 2 || !email.includes("@") || message.length < 10) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const body = JSON.stringify({
    name,
    email,
    company,
    phone,
    message,
    source,
    lead_id,
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
