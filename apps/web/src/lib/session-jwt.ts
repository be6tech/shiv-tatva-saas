import "server-only";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { jwtSecretBytes } from "@/lib/admin-auth";
import { readSessionTokenFromRequest } from "@/lib/auth-cookie";

export type SessionUser = {
  sub: string;
  role: "admin" | "employee";
};

export async function verifySessionToken(token: string | null): Promise<SessionUser | null> {
  if (!token || token === "cookie") return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecretBytes(), {
      issuer: process.env.JWT_ISSUER || "shivtatva",
      audience: process.env.JWT_AUDIENCE || "shivtatva-app",
    });
    const role = payload.role;
    const sub = payload.sub;
    if (typeof sub !== "string") return null;
    if (role !== "admin" && role !== "employee") return null;
    return { sub, role };
  } catch {
    return null;
  }
}

export async function verifySessionBearer(
  authorization: string | null
): Promise<SessionUser | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return verifySessionToken(token);
}

export async function verifySessionRequest(req: Request | NextRequest): Promise<SessionUser | null> {
  return verifySessionToken(readSessionTokenFromRequest(req));
}
