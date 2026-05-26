/**
 * One-time check: hrms_onboarding_submissions table must exist in Supabase.
 * Run: node scripts/ensure-onboarding-table.mjs
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

const env = loadEnv();
const base = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!base || !key) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local");
  process.exit(1);
}

const res = await fetch(`${base}/rest/v1/hrms_onboarding_submissions?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (res.ok) {
  const rows = await res.json();
  console.log("OK: hrms_onboarding_submissions exists.", rows.length ? "Has data." : "Empty table.");
  process.exit(0);
}

const body = await res.text();
if (res.status === 404 || body.includes("PGRST205") || body.includes("does not exist")) {
  console.error(
    "Table missing. Run once in Supabase SQL Editor:\n  apps/web/supabase/hrms_onboarding_documents.sql"
  );
  process.exit(1);
}

console.error("Check failed:", res.status, body.slice(0, 200));
process.exit(1);
