import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";
import { ONBOARDING_FILE_KEYS, ONBOARDING_POLICIES } from "@/lib/onboarding-fields";
import {
  ONBOARDING_MAX_FILE_BYTES,
  ONBOARDING_MAX_TOTAL_BYTES,
} from "@/lib/onboarding-upload-limits";

export const maxDuration = 60;

function newId(): string {
  return `onb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type EncodedFile = { filename: string; mime: string; data: string };

async function encodeUploadFile(file: File, fieldKey: string): Promise<EncodedFile> {
  if (file.size > ONBOARDING_MAX_FILE_BYTES) {
    throw new Error(`file_too_large:${fieldKey}`);
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

  const files: Record<string, EncodedFile> = {};
  const pending: { key: string; file: File }[] = [];
  let totalRawBytes = 0;

  for (const key of ONBOARDING_FILE_KEYS) {
    const file = form.get(key);
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "documents_required", field: key }, { status: 400 });
    }
    if (file.size > ONBOARDING_MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: "file_too_large", field: key }, { status: 400 });
    }
    totalRawBytes += file.size;
    pending.push({ key, file });
  }

  const optionalPolicies = form.get("policiesDoc");
  if (optionalPolicies instanceof File && optionalPolicies.size > 0) {
    if (optionalPolicies.size > ONBOARDING_MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: "file_too_large", field: "policiesDoc" }, { status: 400 });
    }
    totalRawBytes += optionalPolicies.size;
    pending.push({ key: "policiesDoc", file: optionalPolicies });
  }

  if (totalRawBytes > ONBOARDING_MAX_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 400 });
  }

  try {
    for (const { key, file } of pending) {
      files[key] = await encodeUploadFile(file, key);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("file_too_large:")) {
      return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "invalid_file" }, { status: 400 });
  }

  const cfg = getSupabaseAdminConfig();
  if (!cfg) {
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

  const url = `${cfg.base}/rest/v1/hrms_onboarding_submissions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
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
