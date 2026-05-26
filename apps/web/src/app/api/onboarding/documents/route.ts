import { NextResponse } from "next/server";
import { ONBOARDING_FILE_KEYS, ONBOARDING_POLICIES } from "@/lib/onboarding-fields";

const MAX_FILE_BYTES = 1_000_000;

function normalizeSupabaseProjectUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, "");
  u = u.replace(/\/rest\/v1\/?$/i, "");
  return u;
}

function newId(): string {
  return `onb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function readFileField(
  form: FormData,
  key: string
): Promise<{ filename: string; mime: string; data: string } | null> {
  const file = form.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`file_too_large:${key}`);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    filename: file.name.slice(0, 200),
    mime: file.type || "application/octet-stream",
    data: buf.toString("base64"),
  };
}

function field(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/**
 * Public onboarding submission (no auth). Stores personal + file uploads in Supabase.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const name = field(form, "name");
  const phone = field(form, "phone");
  const email = field(form, "email");
  const gender = field(form, "gender");
  const fatherName = field(form, "fatherName");
  const motherName = field(form, "motherName");
  const ageRaw = field(form, "age");
  const parentsPhone = field(form, "parentsPhone");
  const aadharNumber = field(form, "aadharNumber");
  const isExperienced = field(form, "isExperienced") === "yes";
  const previousCompanyDetails = field(form, "previousCompanyDetails");

  const age = Number.parseInt(ageRaw, 10);

  if (name.length < 2 || phone.length < 10 || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  if (!gender || fatherName.length < 2 || motherName.length < 2) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  if (!Number.isFinite(age) || age < 18 || age > 70) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  if (parentsPhone.length < 10) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  if (aadharNumber.replace(/\s/g, "").length < 12) {
    return NextResponse.json({ ok: false, error: "aadhar_required" }, { status: 400 });
  }
  if (isExperienced && previousCompanyDetails.length < 10) {
    return NextResponse.json({ ok: false, error: "experience_required" }, { status: 400 });
  }

  const policiesAck: Record<string, boolean> = {};
  for (const p of ONBOARDING_POLICIES) {
    policiesAck[p.id] = form.get(`policy_${p.id}`) === "true";
  }
  if (!ONBOARDING_POLICIES.every((p) => policiesAck[p.id])) {
    return NextResponse.json({ ok: false, error: "policies_required" }, { status: 400 });
  }

  const files: Record<string, { filename: string; mime: string; data: string }> = {};

  try {
    for (const key of ONBOARDING_FILE_KEYS) {
      const uploaded = await readFileField(form, key);
      if (!uploaded) {
        return NextResponse.json({ ok: false, error: "documents_required", field: key }, { status: 400 });
      }
      files[key] = uploaded;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("file_too_large:")) {
      return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "invalid_file" }, { status: 400 });
  }

  try {
    const policiesDoc = await readFileField(form, "policiesDoc");
    if (policiesDoc) files.policiesDoc = policiesDoc;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("file_too_large:")) {
      return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "invalid_file" }, { status: 400 });
  }

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const rawUrl =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!supabaseKey || !rawUrl) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const personal = {
    gender,
    father_name: fatherName,
    mother_name: motherName,
    age,
    parents_phone: parentsPhone,
    aadhar_number: aadharNumber.replace(/\s/g, ""),
    is_experienced: isExperienced,
    previous_company_details: isExperienced ? previousCompanyDetails : null,
    policies_ack: policiesAck,
  };

  const row = {
    id: newId(),
    name,
    phone,
    email,
    personal,
    files,
    status: "submitted",
  };

  const base = normalizeSupabaseProjectUrl(rawUrl);
  const url = `${base}/rest/v1/hrms_onboarding_submissions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: "supabase", status: res.status, detail: text.slice(0, 500) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, id: row.id });
}
