import { NextResponse } from "next/server";

function normalizeSupabaseProjectUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, "");
  u = u.replace(/\/rest\/v1\/?$/i, "");
  return u;
}

type Body = {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  portfolio?: string | null;
  message?: string;
  application_id?: string | null;
};

/** Inserts into public.career_applications (server-only service role). */
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
  const role = String(parsed.role ?? "").trim();
  const phone = parsed.phone != null ? String(parsed.phone).trim() || null : null;
  const portfolio = parsed.portfolio != null ? String(parsed.portfolio).trim() || null : null;
  const application_id =
    parsed.application_id != null ? String(parsed.application_id).trim() || null : null;

  if (name.length < 2 || !email.includes("@") || role.length < 2 || message.length < 10) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const base = normalizeSupabaseProjectUrl(rawUrl);
  const url = `${base}/rest/v1/career_applications`;

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
      phone,
      role,
      portfolio,
      message,
      application_id,
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
