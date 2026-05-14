import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT } from "jose";

export { ADMIN_EMAIL_DEFAULT } from "./admin-auth-constants";

function normalizeSupabaseProjectUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, "");
  u = u.replace(/\/rest\/v1\/?$/i, "");
  return u;
}

export function getSupabaseAdminConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const rawUrl =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!key || !rawUrl) return null;
  return { key, base: normalizeSupabaseProjectUrl(rawUrl) };
}

export function hashPassword(password: string, salt?: string): string {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return `${s}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}

export function jwtSecretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim() || "shivtatva_dev_jwt_change_in_production";
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({
    sub: email,
    role: "admin",
    org: "Shiv Tatva Solutions Private Limited",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setIssuer(process.env.JWT_ISSUER || "shivtatva")
    .setAudience(process.env.JWT_AUDIENCE || "shivtatva-app")
    .sign(jwtSecretBytes());
}

export function newResetToken(): string {
  return randomBytes(32).toString("hex");
}

type AdminRow = {
  id: string;
  email: string;
  password_hash: string;
  reset_token: string | null;
  reset_token_expires_at: string | null;
};

export async function fetchAdminByEmail(email: string): Promise<AdminRow | null> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;
  const url = `${cfg.base}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=id,email,password_hash,reset_token,reset_token_expires_at&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as AdminRow[];
  return rows[0] ?? null;
}

export async function fetchAdminByResetToken(token: string): Promise<AdminRow | null> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;
  const url = `${cfg.base}/rest/v1/admin_users?reset_token=eq.${encodeURIComponent(token)}&select=id,email,password_hash,reset_token,reset_token_expires_at&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as AdminRow[];
  return rows[0] ?? null;
}

export async function patchAdmin(
  id: string,
  body: Record<string, unknown>
): Promise<boolean> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return false;
  const res = await fetch(`${cfg.base}/rest/v1/admin_users?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
  });
  return res.ok;
}
