import { isCookieSession } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

/** Fetch Next.js /api/admin/* routes (not HRMS gateway). */
export async function adminPortalFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = path.startsWith("/api/admin") ? path : `/api/admin${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const cookieSession = isCookieSession(init.token ?? null);
  if (init.token && !cookieSession) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.clone().json();
    } catch {
      data = await res.text().catch(() => null);
    }
    throw new ApiError(`Admin API ${res.status}`, res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function onboardingFileUrl(submissionId: string, fileKey: string, download = false) {
  const q = download ? "?download=1" : "";
  return `/api/admin/onboarding/submissions/${encodeURIComponent(submissionId)}/files/${encodeURIComponent(fileKey)}${q}`;
}
