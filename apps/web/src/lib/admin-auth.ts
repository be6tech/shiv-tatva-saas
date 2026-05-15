import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT } from "jose";
import { readSessionTokenFromRequest } from "@/lib/auth-cookie";

export { ADMIN_EMAIL_DEFAULT, ADMIN_SEED_PASSWORD_HASH } from "./admin-auth-constants";
import { ADMIN_EMAIL_DEFAULT, ADMIN_SEED_PASSWORD_HASH } from "./admin-auth-constants";

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
  // Match api-gateway default so admin dashboard API calls work in local dev.
  const secret = process.env.JWT_SECRET?.trim() || "dev_secret";
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

export async function verifyAdminBearer(
  authorization: string | null
): Promise<{ email: string } | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token || token === "cookie") return null;
  try {
    const { jwtVerify } = await import("jose");
    const { payload } = await jwtVerify(token, jwtSecretBytes(), {
      issuer: process.env.JWT_ISSUER || "shivtatva",
      audience: process.env.JWT_AUDIENCE || "shivtatva-app",
    });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

export async function verifyAdminRequest(req: Request): Promise<{ email: string } | null> {
  const token = readSessionTokenFromRequest(req);
  if (!token) return null;
  return verifyAdminBearer(`Bearer ${token}`);
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
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("supabase_unreachable");
  }
  if (!res.ok) return null;
  const rows = (await res.json()) as AdminRow[];
  return rows[0] ?? null;
}

export function verifySeedAdminLogin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL_DEFAULT &&
    verifyPassword(password, ADMIN_SEED_PASSWORD_HASH)
  );
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ email: string } | { error: "invalid_credentials" | "service_unavailable" | "not_configured" }> {
  const normalized = email.trim().toLowerCase();
  const cfg = getSupabaseAdminConfig();

  if (!cfg) {
    return { error: "not_configured" };
  }

  try {
    const admin = await fetchAdminByEmail(normalized);
    if (admin && verifyPassword(password, admin.password_hash)) {
      return { email: admin.email };
    }
  } catch {
    return { error: "service_unavailable" };
  }

  return { error: "invalid_credentials" };
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
