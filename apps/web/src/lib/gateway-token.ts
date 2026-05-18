import "server-only";
import jwt from "jsonwebtoken";

/** Gateway-compatible JWT (jsonwebtoken), same shape as POST /auth/login on api-gateway. */
export function signGatewayJwt(sub: string, role: "admin" | "employee"): string {
  const secret = process.env.JWT_SECRET?.trim() || "dev_secret";
  return jwt.sign(
    {
      sub,
      role,
      org: "Shiv Tatva Solutions Private Limited",
    },
    secret,
    {
      expiresIn: "8h",
      issuer: process.env.JWT_ISSUER || "shivtatva",
      audience: process.env.JWT_AUDIENCE || "shivtatva-app",
    }
  );
}

/** Production Render gateway (used on Vercel when env vars are missing). */
export const DEFAULT_PRODUCTION_GATEWAY_URL =
  "https://shivtatva-api-gateway.onrender.com";

/** HRMS api-gateway base URL. Never uses localhost on Vercel. */
export function gatewayBaseUrl(): string | null {
  const explicit =
    process.env.API_GATEWAY_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL) {
    return DEFAULT_PRODUCTION_GATEWAY_URL.replace(/\/+$/, "");
  }
  return "http://localhost:4000";
}

export function shouldUseHrmsFallback(): boolean {
  return gatewayBaseUrl() === null;
}
