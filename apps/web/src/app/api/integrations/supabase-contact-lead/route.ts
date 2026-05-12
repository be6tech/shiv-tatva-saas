import { NextResponse } from "next/server";

function normalizeSupabaseProjectUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, "");
  u = u.replace(/\/rest\/v1\/?$/i, "");
  return u;
}

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
 * Inserts into Supabase using the **service role** key (server only).
 * Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
 */
export async function POST(req: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const rawUrl =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!key || !rawUrl) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
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
  const company = parsed.company != null ? String(parsed.company).trim() || null : null;
  const phone = parsed.phone != null ? String(parsed.phone).trim() || null : null;
  const source = String(parsed.source ?? "contact").trim() || "contact";
  const lead_id = parsed.lead_id != null ? String(parsed.lead_id).trim() || null : null;

  if (name.length < 2 || !email.includes("@") || message.length < 10) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const base = normalizeSupabaseProjectUrl(rawUrl);
  const url = `${base}/rest/v1/contact_leads`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name,
      email,
      company,
      phone,
      message,
      source,
      lead_id,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: "supabase", status: res.status, detail: text.slice(0, 500) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
