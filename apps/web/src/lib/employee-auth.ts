import "server-only";
import { SignJWT } from "jose";
import {
  getSupabaseAdminConfig,
  hashPassword,
  newResetToken,
  verifyPassword,
  jwtSecretBytes,
} from "@/lib/admin-auth";
import {
  EMPLOYEE_EMAIL_DEFAULT,
  EMPLOYEE_ID_DEFAULT,
  EMPLOYEE_ROSTER,
  EMPLOYEE_SEED_PASSWORD_HASH,
} from "@/lib/employee-auth-constants";

export {
  EMPLOYEE_EMAIL_DEFAULT,
  EMPLOYEE_ID_DEFAULT,
  EMPLOYEE_ROSTER,
  EMPLOYEE_SEED_PASSWORD_HASH,
} from "@/lib/employee-auth-constants";

export type EmployeeRow = {
  id: string;
  employee_id: string;
  email: string;
  password_hash: string;
  reset_token: string | null;
  reset_token_expires_at: string | null;
};

const employeeSelect =
  "id,employee_id,email,password_hash,reset_token,reset_token_expires_at";

function normalizeIdentifier(raw: string): string {
  return raw.trim();
}

function isEmail(value: string): boolean {
  return value.includes("@");
}

async function supabaseGet(path: string): Promise<Response> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) throw new Error("not_configured");
  try {
    return await fetch(`${cfg.base}${path}`, {
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
}

export async function fetchEmployeeByIdentifier(
  identifier: string
): Promise<EmployeeRow | null> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;

  const value = normalizeIdentifier(identifier);
  const url = isEmail(value)
    ? `/rest/v1/employee_users?email=eq.${encodeURIComponent(value.toLowerCase())}&select=${employeeSelect}&limit=1`
    : `/rest/v1/employee_users?employee_id=eq.${encodeURIComponent(value)}&select=${employeeSelect}&limit=1`;

  const res = await supabaseGet(url);
  if (!res.ok) return null;
  const rows = (await res.json()) as EmployeeRow[];
  return rows[0] ?? null;
}

export async function fetchEmployeeByResetToken(token: string): Promise<EmployeeRow | null> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;
  const url = `/rest/v1/employee_users?reset_token=eq.${encodeURIComponent(token)}&select=${employeeSelect}&limit=1`;
  const res = await supabaseGet(url);
  if (!res.ok) return null;
  const rows = (await res.json()) as EmployeeRow[];
  return rows[0] ?? null;
}

export async function patchEmployee(id: string, body: Record<string, unknown>): Promise<boolean> {
  const cfg = getSupabaseAdminConfig();
  if (!cfg) return false;
  const res = await fetch(`${cfg.base}/rest/v1/employee_users?id=eq.${id}`, {
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

/** Create DB row from roster when missing (production + after employee_users.sql). */
export async function ensureEmployeeRow(
  employeeId: string,
  email: string
): Promise<EmployeeRow | null> {
  const existing = await fetchEmployeeByIdentifier(employeeId);
  if (existing) return existing;

  const cfg = getSupabaseAdminConfig();
  if (!cfg) return null;

  const res = await fetch(`${cfg.base}/rest/v1/employee_users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      employee_id: employeeId,
      email: email.toLowerCase(),
      password_hash: EMPLOYEE_SEED_PASSWORD_HASH,
    }),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as EmployeeRow[];
  return rows[0] ?? null;
}

export async function saveEmployeeResetOtp(
  employeeId: string,
  email: string,
  otp: string,
  expires: string
): Promise<EmployeeRow | null> {
  const row = await ensureEmployeeRow(employeeId, email);
  if (!row) return null;
  const ok = await patchEmployee(row.id, {
    reset_token: otp,
    reset_token_expires_at: expires,
  });
  return ok ? { ...row, reset_token: otp, reset_token_expires_at: expires } : null;
}

export async function signEmployeeToken(employeeId: string): Promise<string> {
  return new SignJWT({
    sub: employeeId,
    role: "employee",
    org: "Shiv Tatva Solutions Private Limited",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setIssuer(process.env.JWT_ISSUER || "shivtatva")
    .setAudience(process.env.JWT_AUDIENCE || "shivtatva-app")
    .sign(jwtSecretBytes());
}

export function verifySeedEmployeeLogin(identifier: string, password: string): boolean {
  const value = normalizeIdentifier(identifier);
  const match = EMPLOYEE_ROSTER.find(
    (e) =>
      e.id.toUpperCase() === value.toUpperCase() ||
      e.email.toLowerCase() === value.toLowerCase()
  );
  return !!match && verifyPassword(password, EMPLOYEE_SEED_PASSWORD_HASH);
}

export function seedEmployeeIdForIdentifier(identifier: string): string | null {
  const value = normalizeIdentifier(identifier);
  const match = EMPLOYEE_ROSTER.find(
    (e) =>
      e.id.toUpperCase() === value.toUpperCase() ||
      e.email.toLowerCase() === value.toLowerCase()
  );
  return match?.id ?? null;
}

export async function authenticateEmployee(
  identifier: string,
  password: string
): Promise<
  { employeeId: string } | { error: "invalid_credentials" | "service_unavailable" | "not_configured" }
> {
  const value = normalizeIdentifier(identifier);
  if (!value) return { error: "invalid_credentials" };

  const cfg = getSupabaseAdminConfig();
  if (!cfg) {
    const seedId = seedEmployeeIdForIdentifier(value);
    if (process.env.NODE_ENV === "development" && seedId && verifySeedEmployeeLogin(value, password)) {
      return { employeeId: seedId };
    }
    return { error: "not_configured" };
  }

  try {
    const employee = await fetchEmployeeByIdentifier(value);
    if (employee && verifyPassword(password, employee.password_hash)) {
      return { employeeId: employee.employee_id };
    }
  } catch (e) {
    const seedId = seedEmployeeIdForIdentifier(value);
    if (process.env.NODE_ENV === "development" && seedId && verifySeedEmployeeLogin(value, password)) {
      return { employeeId: seedId };
    }
    if (e instanceof Error && e.message === "not_configured") {
      return { error: "not_configured" };
    }
    return { error: "service_unavailable" };
  }

  if (process.env.NODE_ENV === "development" && verifySeedEmployeeLogin(value, password)) {
    const seedId = seedEmployeeIdForIdentifier(value);
    if (seedId) return { employeeId: seedId };
  }

  return { error: "invalid_credentials" };
}

export { hashPassword, newResetToken };
