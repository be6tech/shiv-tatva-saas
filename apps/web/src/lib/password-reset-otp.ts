import "server-only";
import { randomInt } from "node:crypto";

export const OTP_EXPIRY_MS = 15 * 60 * 1000;

export function generateOtp(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function otpExpiresAt(): string {
  return new Date(Date.now() + OTP_EXPIRY_MS).toISOString();
}
