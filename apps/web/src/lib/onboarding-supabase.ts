import "server-only";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";

export type StoredOnboardingFile = {
  filename: string;
  mime: string;
  data: string;
};

export type OnboardingSubmissionRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  personal: Record<string, unknown>;
  files: Record<string, StoredOnboardingFile>;
  status: string;
  created_at: string;
};

function supabaseHeaders(key: string, extra?: HeadersInit): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

export async function listOnboardingSubmissions(): Promise<OnboardingSubmissionRow[] | null> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;

  const url = `${cfg.base}/rest/v1/hrms_onboarding_submissions?select=id,name,phone,email,personal,status,created_at&order=created_at.desc&limit=200`;
  const res = await fetch(url, {
    headers: supabaseHeaders(cfg.key),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Omit<OnboardingSubmissionRow, "files">[];
  return rows.map((r) => ({ ...r, files: {} }));
}

export async function getOnboardingSubmission(id: string): Promise<OnboardingSubmissionRow | null> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;

  const url = `${cfg.base}/rest/v1/hrms_onboarding_submissions?id=eq.${encodeURIComponent(id)}&select=*&limit=1`;
  const res = await fetch(url, {
    headers: supabaseHeaders(cfg.key),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as OnboardingSubmissionRow[];
  return rows[0] ?? null;
}

export async function patchOnboardingStatus(id: string, status: string): Promise<boolean> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return false;

  const res = await fetch(
    `${cfg.base}/rest/v1/hrms_onboarding_submissions?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: supabaseHeaders(cfg.key, {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify({ status }),
    }
  );
  return res.ok;
}
