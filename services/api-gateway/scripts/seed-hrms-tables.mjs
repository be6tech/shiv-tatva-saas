/**
 * Upload services/api-gateway/data/db.json into normalized Supabase HRMS tables.
 * Prerequisite: run apps/web/supabase/hrms_schema.sql in Supabase SQL Editor.
 *
 * Usage (from repo root):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node services/api-gateway/scripts/seed-hrms-tables.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedSupabaseTablesFromObject } from "../src/persist.js";
import { deleteLegacyHrmsEmployees } from "../src/supabase-tables.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "..", "data", "db.json");

const raw = fs.readFileSync(dbPath, "utf8");
const data = JSON.parse(raw);

await deleteLegacyHrmsEmployees();
await seedSupabaseTablesFromObject(data);
console.log(
  `Seeded HRMS tables (${Object.keys(data).join(", ")}) from ${dbPath}. ` +
    `Verify GET /health → storage: "supabase-tables".`
);
