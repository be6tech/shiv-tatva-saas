import "server-only";
import { randomInt } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/admin-auth";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;

/** 6-digit numeric OTP */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
}

export function hashOtpCode(otp: string): string {
  return hashPassword(otp);
}

export function verifyOtpCode(otp: string, storedHash: string | null): boolean {
  if (!storedHash || !otp) return false;
  return verifyPassword(otp, storedHash);
}

/** Legacy reset links store a long hex token (no scrypt salt:hash shape). */
export function isLegacyResetToken(value: string | null): boolean {
  if (!value) return false;
  if (value.includes(":")) return false;
  return /^[a-f0-9]{32,}$/i.test(value);
}

export function otpExpiresAt(): string {
  return new Date(Date.now() + OTP_TTL_MS).toISOString();
}

export function isOtpExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}
