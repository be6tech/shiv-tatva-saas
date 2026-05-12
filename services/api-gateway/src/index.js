import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { requireAuth } from "./auth/jwt.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api-gateway", ts: new Date().toISOString() });
});

// Demo login issuing JWTs (replace with real auth + OAuth later)
app.post("/auth/login", (req, res) => {
  const schema = z.object({
    type: z.enum(["admin", "employee"]),
    identifier: z.string().min(1),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const secret = process.env.JWT_SECRET || "dev_secret";
  const token = jwt.sign(
    {
      sub: parsed.data.identifier,
      role: parsed.data.type,
      org: "Shiv Tatva Solutions Private Limited",
    },
    secret,
    {
      expiresIn: "8h",
      issuer: process.env.JWT_ISSUER || "shivtatva",
      audience: process.env.JWT_AUDIENCE || "shivtatva-app",
    }
  );

  res.json({
    token,
    user: { id: parsed.data.identifier, role: parsed.data.type },
  });
});

// HRMS-ish demo endpoints
app.get("/admin/employees", requireAuth({ roles: ["admin"] }), (_req, res) => {
  res.json({
    employees,
  });
});

// Public lead capture (Contact / Book demo)
app.post("/public/leads", (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    company: z.string().min(1).max(120).optional(),
    phone: z.string().min(6).max(30).optional(),
    message: z.string().min(10).max(2000),
    source: z.string().min(1).max(40).optional(), // "contact"
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const now = new Date().toISOString();
  const id = `LEAD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  const row = {
    id,
    ...parsed.data,
    status: "New",
    createdAt: now,
  };
  leads.unshift(row);
  if (leads.length > 500) leads.length = 500;
  notifyAdmin({
    severity: "info",
    category: "leads",
    title: "New enquiry received",
    message: `${row.name} • ${row.email}${row.company ? ` • ${row.company}` : ""}`,
  });
  scheduleSave();
  res.json({ ok: true, leadId: id });
});

app.get("/admin/leads", requireAuth({ roles: ["admin"] }), (_req, res) => {
  res.json({ leads: leads.slice(0, 200) });
});

// Org settings
app.get("/admin/settings", requireAuth({ roles: ["admin"] }), (_req, res) => {
  res.json({ settings: orgSettings });
});

app.put("/admin/settings", requireAuth({ roles: ["admin"] }), (req, res) => {
  const schema = z.object({
    companyName: z.string().min(2).max(120).optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().min(6).max(30).optional(),
    locationText: z.string().min(2).max(160).optional(),
    workHoursPerDay: z.number().min(1).max(24).optional(),
    lateThresholdMinutes: z.number().min(0).max(240).optional(),
    anomalySpikeRatio: z.number().min(0.1).max(0.9).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  orgSettings = { ...orgSettings, ...parsed.data };
  scheduleSave();
  notifyAdmin({
    severity: "info",
    category: "system",
    title: "Settings updated",
    message: "Organization settings were updated.",
  });
  res.json({ ok: true, settings: orgSettings });
});

app.get("/public/settings", (_req, res) => {
  res.json({
    public: {
      companyName: orgSettings.companyName,
      supportEmail: orgSettings.supportEmail,
      supportPhone: orgSettings.supportPhone,
      locationText: orgSettings.locationText,
    },
  });
});

app.put("/admin/leads/:id", requireAuth({ roles: ["admin"] }), (req, res) => {
  const id = String(req.params.id || "");
  const idx = leads.findIndex((l) => l.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });

  const schema = z.object({
    status: z.enum(["New", "In Progress", "Won", "Lost"]).optional(),
    internalNotes: z.string().max(2000).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const now = new Date().toISOString();
  const prev = leads[idx];
  const next = {
    ...prev,
    ...parsed.data,
    updatedAt: now,
  };
  leads[idx] = next;
  scheduleSave();
  notifyAdmin({
    severity: "info",
    category: "leads",
    title: "Lead updated",
    message: `${next.name} • ${next.email} • ${parsed.data.status ? `Status: ${parsed.data.status}` : "Notes updated"}`,
  });
  res.json({ ok: true, lead: next });
});

app.get("/employee/profile", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const employeeId = String(req.user?.sub || "");
  const emp = findEmployee(employeeId);
  if (!emp) return res.status(404).json({ error: "employee_not_found" });
  res.json({ employee: emp });
});

app.put("/employee/profile", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const employeeId = String(req.user?.sub || "");
  const emp = findEmployee(employeeId);
  if (!emp) return res.status(404).json({ error: "employee_not_found" });

  const schema = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(6).max(30).optional(),
    location: z.string().min(2).max(80).optional(),
    linkedin: z.string().max(200).optional(),
    skills: z.array(z.string().min(1).max(40)).max(40).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const updated = {
    ...emp,
    ...parsed.data,
  };
  upsertEmployee(updated);
  notifyAdmin({
    severity: "info",
    category: "system",
    title: "Profile updated",
    message: `${emp.name} (${emp.id}) updated profile details.`,
  });
  res.json({ ok: true, employee: updated });
});

app.put("/admin/employees/:id", requireAuth({ roles: ["admin"] }), (req, res) => {
  const id = String(req.params.id || "");
  const emp = findEmployee(id);
  if (!emp) return res.status(404).json({ error: "employee_not_found" });

  const schema = z.object({
    name: z.string().min(2).max(80).optional(),
    department: z.string().min(2).max(80).optional(),
    designation: z.string().min(2).max(80).optional(),
    status: z.string().min(2).max(40).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(30).optional(),
    location: z.string().min(2).max(80).optional(),
    linkedin: z.string().max(200).optional(),
    skills: z.array(z.string().min(1).max(40)).max(40).optional(),
    experienceYears: z.number().nonnegative().max(60).optional(),
    joinedAt: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const updated = { ...emp, ...parsed.data };
  upsertEmployee(updated);
  notifyEmployee(updated.id, {
    severity: "info",
    category: "system",
    title: "Directory updated",
    message: "Your HRMS directory profile was updated by Admin.",
  });
  res.json({ ok: true, employee: updated });
});

app.get("/employee/me", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  res.json({ me: req.user });
});

// ---------------------------------------------------------------------------
// Attendance (in-memory demo store; swap to DB + Redis later)
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");
const DATA_PATH = path.join(DATA_DIR, "db.json");

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

function loadDb() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      ensureDataDir();
      const payload = {
        employees,
        attendance: Object.fromEntries(attendanceStore.entries()),
        employeeShift: Object.fromEntries(employeeShift.entries()),
        leaveRequests,
        tasks,
        payslips,
        notifications,
        leads,
        anomalyEmitted,
        orgSettings,
      };
      fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), "utf8");
    } catch {
      // ignore
    }
  }, 250);
}

let employees = [
  {
    id: "ST-EMP-001",
    name: "Demo Employee",
    department: "Engineering",
    designation: "Frontend Developer",
    status: "Active",
    email: "demo.employee@shivtatva.com",
    phone: "+91 90000 00000",
    location: "India",
    linkedin: "https://linkedin.com",
    joinedAt: "2025-01-15",
    skills: ["React", "Next.js", "TypeScript", "Tailwind"],
    experienceYears: 3,
  },
];

const attendanceKey = (dateKey, employeeId) => `${dateKey}:${employeeId}`;
/** @type {Map<string, any>} */
const attendanceStore = new Map();

const shiftTypes = [
  { id: "morning", name: "Morning Shift", start: "09:00", end: "18:00" },
  { id: "evening", name: "Evening Shift", start: "13:00", end: "22:00" },
  { id: "night", name: "Night Shift", start: "22:00", end: "07:00" },
  { id: "flex", name: "Flexible Shift", start: "Flexible", end: "Flexible" },
];
/** @type {Map<string, string>} */
const employeeShift = new Map([["ST-EMP-001", "morning"]]);

/** @type {any[]} */
const leaveRequests = [];

/** @type {any[]} */
const tasks = [];

/** @type {any[]} */
const payslips = [];

/** @type {any[]} */
const notifications = [];

/** @type {any[]} */
const leads = [];

// tracks which anomaly alerts were already emitted (persisted)
/** @type {Record<string, boolean>} */
let anomalyEmitted = {};

/** @type {any} */
let orgSettings = {
  companyName: "Shiv Tatva Solutions Private Limited",
  supportEmail: "support@shivtatva.com",
  supportPhone: "+91 90000 00000",
  locationText: "India • Cloud-native delivery",
  workHoursPerDay: 8,
  lateThresholdMinutes: 10,
  anomalySpikeRatio: 0.4,
};

// hydrate persisted state
const db = loadDb();
if (Array.isArray(db?.employees) && db.employees.length > 0) {
  employees = db.employees;
}
if (db?.attendance && typeof db.attendance === "object") {
  for (const [k, v] of Object.entries(db.attendance)) {
    attendanceStore.set(k, v);
  }
}
if (db?.employeeShift && typeof db.employeeShift === "object") {
  for (const [k, v] of Object.entries(db.employeeShift)) {
    employeeShift.set(k, String(v));
  }
}
if (Array.isArray(db?.leaveRequests)) {
  leaveRequests.splice(0, leaveRequests.length, ...db.leaveRequests);
}
if (Array.isArray(db?.tasks)) {
  tasks.splice(0, tasks.length, ...db.tasks);
}
if (Array.isArray(db?.payslips)) {
  payslips.splice(0, payslips.length, ...db.payslips);
}
if (Array.isArray(db?.notifications)) {
  notifications.splice(0, notifications.length, ...db.notifications);
}
if (Array.isArray(db?.leads)) {
  leads.splice(0, leads.length, ...db.leads);
}
if (db?.anomalyEmitted && typeof db.anomalyEmitted === "object") {
  anomalyEmitted = db.anomalyEmitted;
}
if (db?.orgSettings && typeof db.orgSettings === "object") {
  orgSettings = { ...orgSettings, ...db.orgSettings };
}

function nextAllowedFromEvents(events) {
  if (!events?.length) return ["CHECK_IN"];
  const last = events[events.length - 1]?.type;
  switch (last) {
    case "CHECK_IN":
      return ["LUNCH_IN", "BREAK_IN", "CHECK_OUT"];
    case "LUNCH_IN":
      return ["LUNCH_OUT"];
    case "LUNCH_OUT":
      return ["BREAK_IN", "CHECK_OUT"];
    case "BREAK_IN":
      return ["BREAK_OUT"];
    case "BREAK_OUT":
      return ["LUNCH_IN", "BREAK_IN", "CHECK_OUT"];
    case "CHECK_OUT":
      return [];
    default:
      return ["CHECK_IN"];
  }
}

function statusFromEvents(events) {
  if (!events?.length) return "Offline";
  const last = events[events.length - 1]?.type;
  if (last === "CHECK_OUT") return "Checked Out";
  if (last === "LUNCH_IN") return "On Lunch";
  if (last === "BREAK_IN") return "On Break";
  return "Working";
}

function parseHmToMinutes(hm) {
  const [h, m] = String(hm).split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function computeLateAndOvertime(day, shift) {
  const workHours = Math.max(1, Math.min(24, Number(orgSettings?.workHoursPerDay ?? 8)));
  const workMinutes = workHours * 60;
  const lateThreshold = Math.max(0, Number(orgSettings?.lateThresholdMinutes ?? 10));

  const events = day?.events ?? [];
  const checkInAt = events.find((e) => e.type === "CHECK_IN")?.at ?? null;
  const checkOutAt = [...events].reverse().find((e) => e.type === "CHECK_OUT")?.at ?? null;

  let lateMinutes = 0;
  if (checkInAt && shift?.start && shift.start !== "Flexible") {
    const startMin = parseHmToMinutes(shift.start);
    if (startMin != null) {
      const d = new Date(checkInAt);
      const ciMin = d.getHours() * 60 + d.getMinutes();
      lateMinutes = Math.max(0, ciMin - startMin);
    }
  }

  let overtimeMinutes = 0;
  if (checkInAt && checkOutAt) {
    const ms = Math.max(0, new Date(checkOutAt).getTime() - new Date(checkInAt).getTime());
    const totalMin = Math.floor(ms / 60000);
    const sumPairsMin = (startType, endType) => {
      const starts = events.filter((e) => e.type === startType).map((e) => new Date(e.at).getTime());
      const ends = events.filter((e) => e.type === endType).map((e) => new Date(e.at).getTime());
      const len = Math.min(starts.length, ends.length);
      let acc = 0;
      for (let i = 0; i < len; i++) acc += Math.max(0, ends[i] - starts[i]);
      return Math.floor(acc / 60000);
    };
    const lunchMin = sumPairsMin("LUNCH_IN", "LUNCH_OUT");
    const breakMin = sumPairsMin("BREAK_IN", "BREAK_OUT");
    const netMin = Math.max(0, totalMin - lunchMin - breakMin);
    overtimeMinutes = Math.max(0, netMin - workMinutes);
  }

  return {
    late: lateMinutes >= lateThreshold,
    lateMinutes,
    overtimeMinutes,
  };
}

const attendanceEventSchema = z.object({
  type: z.enum([
    "CHECK_IN",
    "CHECK_OUT",
    "LUNCH_IN",
    "LUNCH_OUT",
    "BREAK_IN",
    "BREAK_OUT",
  ]),
});

app.get(
  "/attendance/today",
  requireAuth({ roles: ["employee", "admin"] }),
  (req, res) => {
    const dateKey = new Date().toISOString().slice(0, 10);
    const employeeId = String(req.user?.sub || "");
    const day = attendanceStore.get(attendanceKey(dateKey, employeeId)) || null;
    const shiftId = employeeShift.get(employeeId) || "morning";
    const shift = shiftTypes.find((s) => s.id === shiftId) || shiftTypes[0];
    const allowed = nextAllowedFromEvents(day?.events ?? []);
    const status = statusFromEvents(day?.events ?? []);
    res.json({ day, shift, allowed, status });
  }
);

app.post(
  "/attendance/event",
  requireAuth({ roles: ["employee", "admin"] }),
  (req, res) => {
    const parsed = attendanceEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

    const dateKey = new Date().toISOString().slice(0, 10);
    const employeeId = String(req.user?.sub || "");
    const emp =
      employees.find((e) => e.id === employeeId) ??
      ({ id: employeeId, name: "Employee", department: "Engineering" });
    const employeeName = emp.name;
    const department = emp.department;

    const k = attendanceKey(dateKey, employeeId);
    const existing = attendanceStore.get(k);
    const day =
      existing ??
      ({
        dateKey,
        employeeId,
        employeeName,
        department,
        events: [],
      });

    const allowedNow = nextAllowedFromEvents(day.events);
    if (!allowedNow.includes(parsed.data.type)) {
      return res.status(400).json({
        error: "invalid_flow",
        allowed: allowedNow,
        status: statusFromEvents(day.events),
      });
    }

    // Shift-based validation (non-flex): restrict CHECK_IN to a window around shift start.
    // Admin can override via query ?override=true.
    if (parsed.data.type === "CHECK_IN") {
      const shiftId = employeeShift.get(employeeId) || "morning";
      const shift = shiftTypes.find((s) => s.id === shiftId) || shiftTypes[0];
      const override = req.query?.override === "true";
      if (
        shift?.start &&
        shift.start !== "Flexible" &&
        !(req.user?.role === "admin" && override)
      ) {
        const startMin = parseHmToMinutes(shift.start);
        if (startMin != null) {
          const now = new Date();
          const nowMin = now.getHours() * 60 + now.getMinutes();
          // Allow check-in from 60 min before shift start to 180 min after.
          const minAllowed = startMin - 60;
          const maxAllowed = startMin + 180;
          if (nowMin < minAllowed || nowMin > maxAllowed) {
            return res.status(400).json({
              error: "outside_shift_window",
              shift,
              window: { minAllowed, maxAllowed },
            });
          }
        }
      }
    }

    const next = {
      ...day,
      events: [...day.events, { type: parsed.data.type, at: new Date().toISOString() }],
    };
    attendanceStore.set(k, next);
    scheduleSave();
    res.json({
      day: next,
      allowed: nextAllowedFromEvents(next.events),
      status: statusFromEvents(next.events),
    });
  }
);

app.post(
  "/attendance/reset",
  requireAuth({ roles: ["employee", "admin"] }),
  (req, res) => {
    const dateKey = new Date().toISOString().slice(0, 10);
    const employeeId = String(req.user?.sub || "");
    attendanceStore.delete(attendanceKey(dateKey, employeeId));
    scheduleSave();
    res.json({ ok: true });
  }
);

app.get(
  "/admin/attendance/today",
  requireAuth({ roles: ["admin"] }),
  (_req, res) => {
    const dateKey = new Date().toISOString().slice(0, 10);
    const days = [];
    for (const [k, v] of attendanceStore.entries()) {
      if (k.startsWith(dateKey + ":")) days.push(v);
    }
    res.json({ days });
  }
);

app.get("/admin/live-status", requireAuth({ roles: ["admin"] }), (_req, res) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const rows = employees.map((e) => {
    const day = attendanceStore.get(attendanceKey(dateKey, e.id)) || null;
    const status = statusFromEvents(day?.events ?? []);
    const shiftId = employeeShift.get(e.id) || "morning";
    const shift = shiftTypes.find((s) => s.id === shiftId) || shiftTypes[0];
    const lastAt = day?.events?.length ? day.events[day.events.length - 1].at : null;
    const lastMs = lastAt ? new Date(lastAt).getTime() : 0;
    const online = !!lastAt && now - lastMs < 5 * 60_000 && status !== "Offline";
    const metrics = computeLateAndOvertime(day, shift);
    return {
      employeeId: e.id,
      employeeName: e.name,
      department: e.department,
      designation: e.designation,
      status,
      lastAt,
      shift,
      online,
      ...metrics,
    };
  });
  res.json({ dateKey, rows });
});

app.get("/admin/attendance/metrics", requireAuth({ roles: ["admin"] }), (_req, res) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const rows = employees.map((e) => {
    const day = attendanceStore.get(attendanceKey(dateKey, e.id)) || null;
    const status = statusFromEvents(day?.events ?? []);
    const shiftId = employeeShift.get(e.id) || "morning";
    const shift = shiftTypes.find((s) => s.id === shiftId) || shiftTypes[0];
    const lastAt = day?.events?.length ? day.events[day.events.length - 1].at : null;
    const lastMs = lastAt ? new Date(lastAt).getTime() : 0;
    const online = !!lastAt && now - lastMs < 5 * 60_000 && status !== "Offline";
    const metrics = computeLateAndOvertime(day, shift);
    return { online, ...metrics, overtimeMinutes: metrics.overtimeMinutes ?? 0 };
  });
  const late = rows.filter((r) => r.late).length;
  const overtime = rows.filter((r) => (r.overtimeMinutes ?? 0) > 0).length;
  const online = rows.filter((r) => r.online).length;
  emitAttendanceAnomaliesOncePerDay({
    dateKey,
    lateCount: late,
    overtimeCount: overtime,
    total: employees.length,
  });
  res.json({ dateKey, late, overtime, online, total: employees.length });
});

app.get("/admin/attendance/timeseries", requireAuth({ roles: ["admin"] }), (_req, res) => {
  // Real 7-day series computed from stored attendance events (in-memory store).
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);

    const rows = employees.map((e) => {
      const day = attendanceStore.get(attendanceKey(dateKey, e.id)) || null;
      const shiftId = employeeShift.get(e.id) || "morning";
      const shift = shiftTypes.find((s) => s.id === shiftId) || shiftTypes[0];
      const metrics = computeLateAndOvertime(day, shift);
      const checkedIn = !!day?.events?.some((ev) => ev.type === "CHECK_IN");
      const checkedOut = !!day?.events?.some((ev) => ev.type === "CHECK_OUT");
      return { checkedIn, checkedOut, ...metrics };
    });

    const total = Math.max(1, employees.length);
    const online = 0; // online is only meaningful for today in this demo store
    const late = rows.filter((r) => r.late).length;
    const overtime = rows.filter((r) => (r.overtimeMinutes ?? 0) > 0).length;
    const checkedIn = rows.filter((r) => r.checkedIn).length;
    const checkedOut = rows.filter((r) => r.checkedOut).length;
    days.push({ dateKey, online, late, overtime, checkedIn, checkedOut, total });
  }
  res.json({ days });
});

app.get("/admin/shifts", requireAuth({ roles: ["admin"] }), (_req, res) => {
  res.json({ shifts: shiftTypes });
});

app.post("/admin/shifts/assign", requireAuth({ roles: ["admin"] }), (req, res) => {
  const schema = z.object({
    employeeId: z.string().min(1),
    shiftId: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  if (!shiftTypes.some((s) => s.id === parsed.data.shiftId))
    return res.status(400).json({ error: "invalid_shift" });
  employeeShift.set(parsed.data.employeeId, parsed.data.shiftId);
  scheduleSave();
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Leave management (persisted JSON; swap to DB later)
// ---------------------------------------------------------------------------

const leaveTypeEnum = z.enum(["Annual", "Sick", "WFH", "CompOff", "Unpaid"]);
const leaveStatusEnum = z.enum(["Pending", "Approved", "Rejected", "Cancelled"]);

function isoDateOnly(s) {
  if (typeof s !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function createLeaveId() {
  return `LV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function findEmployee(employeeId) {
  return employees.find((e) => e.id === employeeId) ?? null;
}

function upsertEmployee(next) {
  const idx = employees.findIndex((e) => e.id === next.id);
  if (idx >= 0) employees[idx] = next;
  else employees.unshift(next);
  scheduleSave();
}

function daysBetweenInclusive(from, to) {
  const a = new Date(`${from}T00:00:00.000Z`).getTime();
  const b = new Date(`${to}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (b < a) return null;
  return Math.floor((b - a) / 86400000) + 1;
}

function createNotificationId() {
  return `NTF-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function pushNotification(n) {
  notifications.unshift(n);
  // keep the demo store bounded
  if (notifications.length > 500) notifications.length = 500;
  scheduleSave();
}

function notifyAdmin(params) {
  const now = new Date().toISOString();
  pushNotification({
    id: createNotificationId(),
    scope: "admin",
    recipientId: null,
    severity: params.severity ?? "info",
    category: params.category ?? "system",
    title: params.title ?? "Notification",
    message: params.message ?? "",
    createdAt: now,
    read: false,
  });
}

function notifyEmployee(employeeId, params) {
  const now = new Date().toISOString();
  pushNotification({
    id: createNotificationId(),
    scope: "employee",
    recipientId: employeeId,
    severity: params.severity ?? "info",
    category: params.category ?? "system",
    title: params.title ?? "Notification",
    message: params.message ?? "",
    createdAt: now,
    read: false,
  });
}

function emitAttendanceAnomaliesOncePerDay({ dateKey, lateCount, overtimeCount, total }) {
  // Emit at most once/day for each type, to avoid spamming during polling.
  const lateKey = `late:${dateKey}`;
  const otKey = `overtime:${dateKey}`;

  // Simple thresholds for demo (tune later)
  const ratio = Math.max(0.1, Math.min(0.9, Number(orgSettings?.anomalySpikeRatio ?? 0.4)));
  const lateThreshold = Math.max(1, Math.ceil((total || 1) * ratio));
  const overtimeThreshold = Math.max(1, Math.ceil((total || 1) * ratio));

  if (lateCount >= lateThreshold && !anomalyEmitted[lateKey]) {
    anomalyEmitted[lateKey] = true;
    notifyAdmin({
      severity: "warning",
      category: "system",
      title: "Attendance anomaly: late spike",
      message: `Late arrivals spike detected (${lateCount}/${total}) on ${dateKey}.`,
    });
  }

  if (overtimeCount >= overtimeThreshold && !anomalyEmitted[otKey]) {
    anomalyEmitted[otKey] = true;
    notifyAdmin({
      severity: "warning",
      category: "system",
      title: "Attendance anomaly: overtime spike",
      message: `Overtime spike detected (${overtimeCount}/${total}) on ${dateKey}.`,
    });
  }
}

app.post("/employee/leave/apply", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const schema = z.object({
    type: leaveTypeEnum,
    from: z.string(),
    to: z.string(),
    reason: z.string().min(3).max(500),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const from = isoDateOnly(parsed.data.from);
  const to = isoDateOnly(parsed.data.to);
  if (!from || !to) return res.status(400).json({ error: "invalid_date" });

  const durationDays = daysBetweenInclusive(from, to);
  if (!durationDays) return res.status(400).json({ error: "invalid_date_range" });

  const employeeId = String(req.user?.sub || "");
  const emp = findEmployee(employeeId);
  if (!emp) return res.status(404).json({ error: "employee_not_found" });

  const now = new Date().toISOString();
  const id = createLeaveId();
  const row = {
    id,
    employeeId,
    employeeName: emp.name,
    department: emp.department,
    type: parsed.data.type,
    from,
    to,
    durationDays,
    reason: parsed.data.reason,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, by: employeeId, action: "Applied" }],
  };

  leaveRequests.unshift(row);
  scheduleSave();
  notifyAdmin({
    severity: "info",
    category: "leave",
    title: "Leave request submitted",
    message: `${emp.name} (${employeeId}) requested ${row.type} leave: ${row.from} → ${row.to} (${row.durationDays} days)`,
  });
  res.json({ ok: true, request: row });
});

app.get("/employee/leave/mine", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const employeeId = String(req.user?.sub || "");
  const rows = leaveRequests.filter((r) => r.employeeId === employeeId);
  res.json({ requests: rows });
});

app.get("/admin/leave/requests", requireAuth({ roles: ["admin"] }), (req, res) => {
  const statusQ = typeof req.query.status === "string" ? req.query.status : "";
  const statusParsed = leaveStatusEnum.safeParse(statusQ || "Pending");
  const status = statusQ ? (statusParsed.success ? statusParsed.data : null) : null;
  if (statusQ && !status) return res.status(400).json({ error: "invalid_status" });
  const rows = status ? leaveRequests.filter((r) => r.status === status) : leaveRequests;
  res.json({ requests: rows });
});

app.post("/admin/leave/requests/:id/decision", requireAuth({ roles: ["admin"] }), (req, res) => {
  const schema = z.object({
    decision: z.enum(["approve", "reject"]),
    note: z.string().max(500).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const id = String(req.params.id || "");
  const idx = leaveRequests.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });

  const row = leaveRequests[idx];
  if (row.status !== "Pending") return res.status(409).json({ error: "not_pending" });

  const now = new Date().toISOString();
  const adminId = String(req.user?.sub || "admin");
  const nextStatus = parsed.data.decision === "approve" ? "Approved" : "Rejected";
  row.status = nextStatus;
  row.updatedAt = now;
  row.history = Array.isArray(row.history) ? row.history : [];
  row.history.unshift({
    at: now,
    by: adminId,
    action: nextStatus,
    note: parsed.data.note ?? "",
  });

  leaveRequests[idx] = row;
  scheduleSave();
  notifyEmployee(row.employeeId, {
    severity: nextStatus === "Approved" ? "success" : "warning",
    category: "leave",
    title: `Leave ${nextStatus.toLowerCase()}`,
    message: `${row.type} leave ${row.from} → ${row.to} was ${nextStatus.toLowerCase()}. ${parsed.data.note ? `Note: ${parsed.data.note}` : ""}`.trim(),
  });
  res.json({ ok: true, request: row });
});

// ---------------------------------------------------------------------------
// Tasks (persisted JSON; swap to DB later)
// ---------------------------------------------------------------------------

const taskPriorityEnum = z.enum(["Low", "Medium", "High", "Urgent"]);
const taskStatusEnum = z.enum(["Todo", "InProgress", "Done", "Blocked"]);

function createTaskId() {
  return `TSK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function isoDateOnlyOrNull(s) {
  if (s == null || s === "") return null;
  if (typeof s !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

app.post("/admin/tasks/create", requireAuth({ roles: ["admin"] }), (req, res) => {
  const schema = z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(0).max(1000).optional(),
    assigneeId: z.string().min(1),
    priority: taskPriorityEnum.default("Medium"),
    dueDate: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const assignee = findEmployee(parsed.data.assigneeId);
  if (!assignee) return res.status(404).json({ error: "employee_not_found" });

  const dueDate = isoDateOnlyOrNull(parsed.data.dueDate);
  if (parsed.data.dueDate && !dueDate) return res.status(400).json({ error: "invalid_due_date" });

  const now = new Date().toISOString();
  const id = createTaskId();
  const row = {
    id,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    department: assignee.department,
    priority: parsed.data.priority,
    dueDate,
    status: "Todo",
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, by: "admin", action: "Created" }],
  };
  tasks.unshift(row);
  scheduleSave();
  notifyEmployee(assignee.id, {
    severity: row.priority === "Urgent" || row.priority === "High" ? "warning" : "info",
    category: "tasks",
    title: "New task assigned",
    message: `${row.title}${row.dueDate ? ` (Due: ${row.dueDate})` : ""}`,
  });
  res.json({ ok: true, task: row });
});

app.get("/admin/tasks", requireAuth({ roles: ["admin"] }), (req, res) => {
  const statusQ = typeof req.query.status === "string" ? req.query.status : "";
  const statusParsed = statusQ ? taskStatusEnum.safeParse(statusQ) : { success: true, data: null };
  if (statusQ && !statusParsed.success) return res.status(400).json({ error: "invalid_status" });

  const assigneeId = typeof req.query.assigneeId === "string" ? req.query.assigneeId : "";
  const rows = tasks
    .filter((t) => (statusParsed.data ? t.status === statusParsed.data : true))
    .filter((t) => (assigneeId ? t.assigneeId === assigneeId : true));
  res.json({ tasks: rows });
});

app.get("/employee/tasks/mine", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const employeeId = String(req.user?.sub || "");
  const rows = tasks.filter((t) => t.assigneeId === employeeId);
  res.json({ tasks: rows });
});

app.post("/employee/tasks/:id/status", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const schema = z.object({
    status: taskStatusEnum,
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const id = String(req.params.id || "");
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });

  const employeeId = String(req.user?.sub || "");
  const row = tasks[idx];
  if (row.assigneeId !== employeeId && req.user?.role !== "admin")
    return res.status(403).json({ error: "forbidden" });

  const now = new Date().toISOString();
  row.status = parsed.data.status;
  row.updatedAt = now;
  row.history = Array.isArray(row.history) ? row.history : [];
  row.history.unshift({ at: now, by: employeeId, action: `Status:${parsed.data.status}` });
  tasks[idx] = row;
  scheduleSave();
  notifyAdmin({
    severity: parsed.data.status === "Done" ? "success" : parsed.data.status === "Blocked" ? "warning" : "info",
    category: "tasks",
    title: "Task status updated",
    message: `${row.assigneeName} updated "${row.title}" → ${parsed.data.status}`,
  });
  res.json({ ok: true, task: row });
});

// ---------------------------------------------------------------------------
// Payroll / Payslips (persisted JSON; swap to DB later)
// ---------------------------------------------------------------------------

const currencyINR = (n) => `₹ ${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function createPayslipId() {
  return `PS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function isoMonthOnly(s) {
  if (typeof s !== "string") return null;
  if (!/^\d{4}-\d{2}$/.test(s)) return null;
  return s;
}

function computePayslipTotals(p) {
  const earnings =
    Number(p.basic || 0) +
    Number(p.hra || 0) +
    Number(p.allowances || 0) +
    Number(p.bonus || 0);
  const deductions = Number(p.pf || 0) + Number(p.esi || 0) + Number(p.tds || 0) + Number(p.otherDeductions || 0);
  const net = Math.max(0, earnings - deductions);
  return { earnings, deductions, net };
}

app.post("/admin/payslips/generate", requireAuth({ roles: ["admin"] }), (req, res) => {
  const schema = z.object({
    employeeId: z.string().min(1),
    month: z.string(), // YYYY-MM
    basic: z.number().nonnegative(),
    hra: z.number().nonnegative().default(0),
    allowances: z.number().nonnegative().default(0),
    bonus: z.number().nonnegative().default(0),
    pf: z.number().nonnegative().default(0),
    esi: z.number().nonnegative().default(0),
    tds: z.number().nonnegative().default(0),
    otherDeductions: z.number().nonnegative().default(0),
    notes: z.string().max(800).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const month = isoMonthOnly(parsed.data.month);
  if (!month) return res.status(400).json({ error: "invalid_month" });

  const emp = findEmployee(parsed.data.employeeId);
  if (!emp) return res.status(404).json({ error: "employee_not_found" });

  const existsIdx = payslips.findIndex((p) => p.employeeId === emp.id && p.month === month);
  const now = new Date().toISOString();
  const payload = {
    basic: parsed.data.basic,
    hra: parsed.data.hra ?? 0,
    allowances: parsed.data.allowances ?? 0,
    bonus: parsed.data.bonus ?? 0,
    pf: parsed.data.pf ?? 0,
    esi: parsed.data.esi ?? 0,
    tds: parsed.data.tds ?? 0,
    otherDeductions: parsed.data.otherDeductions ?? 0,
  };
  const totals = computePayslipTotals(payload);
  const row = {
    id: existsIdx >= 0 ? payslips[existsIdx].id : createPayslipId(),
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    designation: emp.designation,
    month,
    currency: "INR",
    ...payload,
    earnings: totals.earnings,
    deductions: totals.deductions,
    netPay: totals.net,
    status: "Generated",
    notes: parsed.data.notes ?? "",
    createdAt: existsIdx >= 0 ? payslips[existsIdx].createdAt : now,
    updatedAt: now,
  };

  if (existsIdx >= 0) payslips[existsIdx] = row;
  else payslips.unshift(row);
  scheduleSave();
  notifyEmployee(emp.id, {
    severity: "success",
    category: "payroll",
    title: "Payslip generated",
    message: `Your payslip for ${row.month} is available (Net: ₹ ${Number(row.netPay).toLocaleString("en-IN")}).`,
  });
  res.json({ ok: true, payslip: row });
});

app.get("/admin/payslips", requireAuth({ roles: ["admin"] }), (req, res) => {
  const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : "";
  const monthQ = typeof req.query.month === "string" ? req.query.month : "";
  const month = monthQ ? isoMonthOnly(monthQ) : null;
  if (monthQ && !month) return res.status(400).json({ error: "invalid_month" });

  const rows = payslips
    .filter((p) => (employeeId ? p.employeeId === employeeId : true))
    .filter((p) => (month ? p.month === month : true));
  res.json({ payslips: rows });
});

app.get("/employee/payslips/mine", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const employeeId = String(req.user?.sub || "");
  const rows = payslips.filter((p) => p.employeeId === employeeId);
  res.json({ payslips: rows });
});

app.get("/employee/payslips/:id", requireAuth({ roles: ["employee", "admin"] }), (req, res) => {
  const id = String(req.params.id || "");
  const row = payslips.find((p) => p.id === id) ?? null;
  if (!row) return res.status(404).json({ error: "not_found" });

  const employeeId = String(req.user?.sub || "");
  if (row.employeeId !== employeeId && req.user?.role !== "admin")
    return res.status(403).json({ error: "forbidden" });

  // For now we return JSON. UI uses this to download as a "payslip JSON" file.
  res.json({ payslip: row, display: { netPay: currencyINR(row.netPay) } });
});

// ---------------------------------------------------------------------------
// AI proxy (API Gateway -> FastAPI service)
// ---------------------------------------------------------------------------
app.post("/ai/insights", requireAuth({ roles: ["admin", "employee"] }), async (req, res) => {
  const target = process.env.AI_SERVICE_URL || "http://localhost:8001";
  try {
    const upstream = await fetch(`${target}/ai/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  } catch (e) {
    return res.status(503).json({ ok: false, error: "ai_service_unavailable" });
  }
});

// ---------------------------------------------------------------------------
// Notifications feed (persisted)
// ---------------------------------------------------------------------------

app.get("/notifications", requireAuth({ roles: ["admin", "employee"] }), (req, res) => {
  const userId = String(req.user?.sub || "");
  const role = String(req.user?.role || "");
  const unreadOnly = String(req.query.unreadOnly || "") === "true";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const limit = Math.min(200, Math.max(1, Number(req.query.limit || 80)));

  const scope = role === "admin" ? "admin" : "employee";
  const rows = notifications
    .filter((n) => n.scope === scope)
    .filter((n) => (scope === "employee" ? n.recipientId === userId : true))
    .filter((n) => (category ? String(n.category || "") === category : true))
    .filter((n) => (unreadOnly ? !n.read : true))
    .slice(0, limit);

  res.json({ items: rows });
});

app.post("/notifications/read-all", requireAuth({ roles: ["admin", "employee"] }), (req, res) => {
  const userId = String(req.user?.sub || "");
  const role = String(req.user?.role || "");
  const scope = role === "admin" ? "admin" : "employee";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  let changed = 0;
  for (let i = 0; i < notifications.length; i++) {
    const n = notifications[i];
    if (n.scope !== scope) continue;
    if (scope === "employee" && n.recipientId !== userId) continue;
    if (category && String(n.category || "") !== category) continue;
    if (!n.read) {
      notifications[i] = { ...n, read: true };
      changed += 1;
    }
  }
  if (changed) scheduleSave();
  res.json({ ok: true, marked: changed });
});

app.post("/notifications/:id/read", requireAuth({ roles: ["admin", "employee"] }), (req, res) => {
  const userId = String(req.user?.sub || "");
  const role = String(req.user?.role || "");
  const scope = role === "admin" ? "admin" : "employee";
  const id = String(req.params.id || "");

  const idx = notifications.findIndex((n) => n.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  const row = notifications[idx];
  if (row.scope !== scope) return res.status(403).json({ error: "forbidden" });
  if (scope === "employee" && row.recipientId !== userId) return res.status(403).json({ error: "forbidden" });

  row.read = true;
  notifications[idx] = row;
  scheduleSave();
  res.json({ ok: true });
});

app.get("/admin/notifications/anomalies", requireAuth({ roles: ["admin"] }), async (_req, res) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  const live = employees.map((e) => {
    const day = attendanceStore.get(attendanceKey(dateKey, e.id)) || null;
    const status = statusFromEvents(day?.events ?? []);
    const shiftId = employeeShift.get(e.id) || "morning";
    const shift = shiftTypes.find((s) => s.id === shiftId) || shiftTypes[0];
    const metrics = computeLateAndOvertime(day, shift);
    return { status, ...metrics };
  });

  const lateCount = live.filter((x) => x.late).length;
  const overtimeCount = live.filter((x) => (x.overtimeMinutes ?? 0) > 0).length;
  const items = [];
  if (lateCount > 0) items.push(`Late arrivals detected: ${lateCount}`);
  if (overtimeCount > 0) items.push(`Overtime detected: ${overtimeCount}`);
  if (items.length === 0) items.push("No anomalies detected right now.");

  // Optional AI enrichment (best-effort)
  const target = process.env.AI_SERVICE_URL || "http://localhost:8001";
  try {
    const upstream = await fetch(`${target}/ai/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department: "All", sample_size: 50 }),
    });
    if (upstream.ok) {
      const data = await upstream.json();
      const ai = Array.isArray(data?.insights) ? data.insights.slice(0, 2) : [];
      for (const s of ai) items.push(String(s));
    }
  } catch {
    // ignore
  }

  res.json({ items });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api-gateway] listening on http://localhost:${port}`);
});

