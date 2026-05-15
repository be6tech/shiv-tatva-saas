/**
 * Upload services/api-gateway/data/db.json into Supabase hrms_store.
 * Usage (from repo root):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node services/api-gateway/scripts/seed-hrms-store.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedSupabaseFromObject } from "../src/persist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "..", "data", "db.json");

const raw = fs.readFileSync(dbPath, "utf8");
const data = JSON.parse(raw);

await seedSupabaseFromObject(data);
console.log(`Seeded hrms_store (${Object.keys(data).join(", ")}) from ${dbPath}`);
