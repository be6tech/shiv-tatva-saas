import { LEADS_API_BASE_EXPLICIT } from "@/lib/api";

/** True on localhost / 127.0.0.1 in the browser. */
export function isLocalBrowserHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/**
 * When false, the app should not call the default `http://localhost:4000` leads API from the
 * deployed site (it always fails). Use Next.js backup routes instead.
 */
export function shouldUseHostedLeadsApi(): boolean {
  if (LEADS_API_BASE_EXPLICIT.length > 0) return true;
  return isLocalBrowserHost();
}
