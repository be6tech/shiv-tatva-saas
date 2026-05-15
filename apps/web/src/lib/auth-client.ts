/** Client-side marker: session JWT lives in httpOnly cookie; API routes read it automatically. */
export const COOKIE_SESSION_MARKER = "cookie";

export function isCookieSession(token: string | null | undefined): boolean {
  return token === COOKIE_SESSION_MARKER;
}
