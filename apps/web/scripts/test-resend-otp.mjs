/**
 * Test Resend OTP email. Usage:
 *   node scripts/test-resend-otp.mjs you@example.com
 *
 * Requires in apps/web/.env.local:
 *   RESEND_API_KEY=re_...
 *   RESEND_FROM_EMAIL=Shiv Tatva <onboarding@resend.dev>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
}

const to = process.argv[2]?.trim();
if (!to || !to.includes("@")) {
  console.error("Usage: node scripts/test-resend-otp.mjs your-email@example.com");
  process.exit(1);
}

const env = loadEnv();
const apiKey = env.RESEND_API_KEY?.trim();
const from = env.RESEND_FROM_EMAIL?.trim() || "Shiv Tatva <onboarding@resend.dev>";

if (!apiKey) {
  console.error("Missing RESEND_API_KEY in apps/web/.env.local");
  process.exit(1);
}

const otp = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "Shiv Tatva — test password reset OTP",
    text: `Test OTP: ${otp}\n\nIf you received this, Resend is configured correctly.`,
    html: `<p>Test OTP: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>Resend is working.</p>`,
  }),
});

const body = await res.text();
if (!res.ok) {
  console.error("Resend failed:", res.status, body);
  process.exit(1);
}

console.log("OK — test email sent to", to);
console.log("Test OTP (for verification):", otp);
