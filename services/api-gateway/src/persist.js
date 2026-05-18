import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadStateFromTables,
  saveStateToTables,
  useRelationalTables,
} from "./supabase-tables.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");
const DATA_PATH = path.join(DATA_DIR, "db.json");
const STORE_ID = "main";

let saveTimer = null;
let storageMode = "file";

export function getStorageMode() {
  return storageMode;
}

function supabaseConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const raw =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!key || !raw) return null;
  let base = raw.replace(/\/+$/, "").replace(/\/rest\/v1\/?$/i, "");
  return { key, base };
}

function supabaseHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function loadFromSupabase() {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  const url = `${cfg.base}/rest/v1/hrms_store?id=eq.${encodeURIComponent(STORE_ID)}&select=data`;
  const res = await fetch(url, { headers: supabaseHeaders(cfg.key) });
  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase load failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const data = rows[0]?.data;
  return data && typeof data === "object" ? data : null;
}

function loadFromFile() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadPersistedState() {
  if (supabaseConfig() && useRelationalTables()) {
    try {
      const data = await loadStateFromTables();
      if (data !== null) {
        storageMode = "supabase-tables";
        return data;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        "[api-gateway] Supabase tables load failed, trying hrms_store:",
        err?.message || err
      );
    }
  }
  if (supabaseConfig()) {
    try {
      const data = await loadFromSupabase();
      storageMode = "supabase";
      return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[api-gateway] Supabase load failed, falling back to file:", err?.message || err);
    }
  }
  storageMode = "file";
  return loadFromFile();
}

async function saveToSupabase(payload) {
  const cfg = supabaseConfig();
  if (!cfg) return false;
  const url = `${cfg.base}/rest/v1/hrms_store`;
  const res = await fetch(url, {
    method: "POST",
    headers: supabaseHeaders(cfg.key, {
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify({
      id: STORE_ID,
      data: payload,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase save failed (${res.status}): ${text.slice(0, 200)}`);
  }
  storageMode = "supabase";
  return true;
}

function saveToFile(payload) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export function schedulePersist(getSnapshot) {
  if (saveTimer) return;
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    const payload = getSnapshot();
    if (supabaseConfig() && useRelationalTables()) {
      try {
        await saveStateToTables(payload);
        storageMode = "supabase-tables";
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          "[api-gateway] Supabase tables save failed, trying hrms_store:",
          err?.message || err
        );
      }
    }
    if (supabaseConfig()) {
      try {
        await saveToSupabase(payload);
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[api-gateway] Supabase save failed, writing file:", err?.message || err);
      }
    }
    saveToFile(payload);
    storageMode = "file";
  }, 250);
}

/** One-time upload of local db.json into Supabase (run from scripts/seed-hrms-store.mjs). */
export async function seedSupabaseFromObject(payload) {
  if (!supabaseConfig()) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  }
  await saveToSupabase(payload);
}

/** One-time upload of db.json into normalized HRMS tables (scripts/seed-hrms-tables.mjs). */
export async function seedSupabaseTablesFromObject(payload) {
  if (!supabaseConfig()) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  }
  await saveStateToTables(payload);
}

export { DATA_PATH };
