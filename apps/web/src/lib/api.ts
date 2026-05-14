import type { AuthRole } from "@/store/slices/authSlice";

/**
 * Non-empty when set at **build** time. Deployed sites must set this to your public API gateway origin
 * (e.g. `https://api.example.com`), or leave unset and use Supabase/Sheet-only flows from the contact page.
 */
export const LEADS_API_BASE_EXPLICIT = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export const API_BASE = LEADS_API_BASE_EXPLICIT || "http://localhost:4000";
/** Used by marketing forms: POST /public/leads on api-gateway (defaults to localhost:4000 in dev). */

function shouldProxyHrms(path: string): boolean {
  return (
    path.startsWith("/admin/") ||
    path.startsWith("/employee/") ||
    path.startsWith("/attendance/") ||
    path.startsWith("/notifications") ||
    path.startsWith("/ai/")
  );
}

function resolveApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (typeof window !== "undefined" && shouldProxyHrms(path)) {
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `/api/hrms/${clean}`;
  }
  return `${API_BASE}${path}`;
}

export type LoginResponse = {
  token: string;
  user: { id: string; role: AuthRole };
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class LoginNetworkError extends Error {
  readonly apiBase: string;

  constructor(apiBase: string) {
    super("Can't connect to the sign-in service.");
    this.name = "LoginNetworkError";
    this.apiBase = apiBase;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = resolveApiUrl(path);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    let data: unknown = null;
    let text = "";
    try {
      data = await res.clone().json();
    } catch {
      text = await res.text().catch(() => "");
      data = text || null;
    }
    const msg =
      typeof data === "object" && data && "error" in (data as any)
        ? `API ${res.status}: ${(data as any).error}`
        : `API ${res.status}: ${text || res.statusText}`;
    throw new ApiError(msg, res.status, data);
  }
  return (await res.json()) as T;
}

export async function login(params: {
  type: AuthRole;
  identifier: string;
  password: string;
}) {
  try {
    return await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error &&
        (e.message === "Failed to fetch" || e.message.toLowerCase().includes("network")));
    if (isNetwork) {
      throw new LoginNetworkError(API_BASE);
    }
    throw e;
  }
}

