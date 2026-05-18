/**
 * Local env smoke test (no secrets printed).
 * Usage: node scripts/test-env-check.mjs
 * Optional: dotenv from ../../apps/web/.env.local via env vars set in shell.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webEnvPath = path.resolve(__dirname, "../../../apps/web/.env.local");

function loadWebEnv() {
  if (!fs.existsSync(webEnvPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(webEnvPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const web = loadWebEnv();
const jwt = process.env.JWT_SECRET || web.JWT_SECRET || "dev_secret";
const supabaseUrl = process.env.SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || web.SUPABASE_SERVICE_ROLE_KEY || "";
const publishable = web.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const base = process.env.API_BASE || "http://localhost:4000";

const report = {
  jwtSecret: jwt ? "set" : "missing",
  supabaseUrl: supabaseUrl ? "set" : "missing",
  serviceRoleKey: serviceKey ? (serviceKey.startsWith("sb_publishable_") ? "WRONG (publishable)" : "set") : "MISSING",
  publishableKey: publishable ? "set" : "missing",
  gateway: null,
  supabaseRest: null,
  attendance: null,
};

async function testGateway() {
  try {
    const health = await fetch(`${base}/health`).then((r) => r.json());
    report.gateway = { ok: true, storage: health.storage };

    const login = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "employee",
        identifier: "BE19990022",
        password: "x",
      }),
    });
    if (!login.ok) {
      report.attendance = { ok: false, step: "login", status: login.status };
      return;
    }
    const { token } = await login.json();
    const auth = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    await fetch(`${base}/attendance/reset`, { method: "POST", headers: auth, body: "{}" });
    const res = await fetch(`${base}/attendance/event`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ type: "CHECK_IN" }),
    });
    const body = await res.json();
    report.attendance = {
      ok: res.ok,
      status: res.status,
      hasEvents: Boolean(body.day?.events?.length),
    };
  } catch (e) {
    report.gateway = { ok: false, error: e.message };
  }
}

async function testSupabase() {
  if (!supabaseUrl || !serviceKey) {
    report.supabaseRest = { ok: false, reason: "no url or service key" };
    return;
  }
  if (serviceKey.startsWith("sb_publishable_")) {
    report.supabaseRest = { ok: false, reason: "publishable key used as service role" };
    return;
  }
  const url = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/admin_users?select=id&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    report.supabaseRest = { ok: res.ok, status: res.status };
  } catch (e) {
    report.supabaseRest = { ok: false, error: e.message };
  }
}

await testSupabase();
await testGateway();
console.log(JSON.stringify(report, null, 2));

const failed =
  report.serviceRoleKey !== "set" ||
  report.supabaseRest?.ok === false ||
  report.gateway?.ok === false ||
  report.attendance?.ok === false;

process.exit(failed ? 1 : 0);
