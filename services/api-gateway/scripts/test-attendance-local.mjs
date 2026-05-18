/**
 * Local smoke test: health → login → check-in → verify file/Supabase storage.
 * Run with api-gateway on PORT (default 4000).
 */
const base = process.env.API_BASE || "http://localhost:4000";
const employeeId = process.env.TEST_EMPLOYEE_ID || "BE19990022";

async function main() {
  const health = await fetch(`${base}/health`).then((r) => r.json());
  console.log("health:", health);

  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "employee",
      identifier: employeeId,
      password: "demo",
    }),
  });
  if (!login.ok) {
    console.error("login failed", login.status, await login.text());
    process.exit(1);
  }
  const { token } = await login.json();
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const event = await fetch(`${base}/attendance/event`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ type: "CHECK_IN" }),
  });
  const eventBody = await event.json();
  if (!event.ok) {
    console.error("CHECK_IN failed", event.status, eventBody);
    process.exit(1);
  }
  console.log("CHECK_IN ok, events:", eventBody.day?.events?.length);

  await new Promise((r) => setTimeout(r, 600));

  const today = await fetch(`${base}/attendance/today`, { headers: auth }).then((r) => r.json());
  const hasCheckIn = today.day?.events?.some((e) => e.type === "CHECK_IN");
  if (!hasCheckIn) {
    console.error("FAIL: today has no CHECK_IN", today);
    process.exit(1);
  }
  console.log("today status:", today.status, "metrics:", today.metrics?.netWorkMinutes);

  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const dateKey = new Date().toISOString().slice(0, 10);
  const storeKey = `${dateKey}:${employeeId}`;
  const stored = db.attendance?.[storeKey];
  if (!stored?.events?.some((e) => e.type === "CHECK_IN")) {
    console.error("FAIL: db.json missing attendance for", storeKey);
    console.log("keys:", Object.keys(db.attendance || {}).slice(0, 5));
    process.exit(1);
  }
  console.log("OK db.json attendance key:", storeKey, "events:", stored.events.length);
  console.log("storage mode from health:", health.storage);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
