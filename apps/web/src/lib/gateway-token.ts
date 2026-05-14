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

export function gatewayBaseUrl(): string {
  return (
    process.env.API_GATEWAY_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "http://localhost:4000"
  );
}
