import "server-only";
import { jwtVerify } from "jose";
import { jwtSecretBytes } from "@/lib/admin-auth";

export type SessionUser = {
  sub: string;
  role: "admin" | "employee";
};

export async function verifySessionBearer(
  authorization: string | null
): Promise<SessionUser | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
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
