/**
 * Load/save HRMS state from normalized Supabase tables (see apps/web/supabase/hrms_schema.sql).
 */

function supabaseConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const raw =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!key || !raw) return null;
  let base = raw.replace(/\/+$/, "").replace(/\/rest\/v1\/?$/i, "");
  return { key, base };
}

function headers(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function restGet(cfg, table, query = "") {
  const url = `${cfg.base}/rest/v1/${table}${query}`;
  const res = await fetch(url, { headers: headers(cfg.key) });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${table} GET failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function restUpsert(cfg, table, rows, onConflict) {
  if (!rows.length) return;
  const conflict = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : "";
  const url = `${cfg.base}/rest/v1/${table}${conflict}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(cfg.key, {
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${table} upsert failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

function employeeToRow(e) {
  const now = new Date().toISOString();
  return {
    id: e.id,
    name: e.name ?? "",
    department: e.department ?? "",
    designation: e.designation ?? "",
    status: e.status ?? "Active",
    email: e.email ?? "",
    phone: e.phone ?? "",
    location: e.location ?? "",
    joined_at: e.joinedAt ?? null,
    skills: Array.isArray(e.skills) ? e.skills : [],
    experience_years: Number(e.experienceYears ?? 0),
    shift_id: e.shiftId ?? e.shift_id ?? null,
    bio: e.bio ?? "",
    linkedin: e.linkedin ?? "",
    updated_at: now,
  };
}

function employeeFromRow(r) {
  return {
    id: r.id,
    name: r.name,
    department: r.department,
    designation: r.designation,
    status: r.status,
    email: r.email,
    phone: r.phone,
    location: r.location,
    joinedAt: r.joined_at ?? undefined,
    skills: r.skills ?? [],
    experienceYears: Number(r.experience_years ?? 0),
    shiftId: r.shift_id ?? undefined,
    bio: r.bio ?? "",
    linkedin: r.linkedin ?? "",
  };
}

function leaveToRow(r) {
  return {
    id: r.id,
    employee_id: r.employeeId,
    employee_name: r.employeeName ?? "",
    department: r.department ?? "",
    type: r.type,
    from_date: r.from,
    to_date: r.to,
    duration_days: r.durationDays ?? 1,
    reason: r.reason ?? "",
    status: r.status ?? "Pending",
    history: r.history ?? [],
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function leaveFromRow(r) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    department: r.department,
    type: r.type,
    from: r.from_date,
    to: r.to_date,
    durationDays: r.duration_days,
    reason: r.reason,
    status: r.status,
    history: r.history ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function taskToRow(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    assignee_id: t.assigneeId,
    assignee_name: t.assigneeName ?? "",
    department: t.department ?? "",
    priority: t.priority ?? "Medium",
    status: t.status ?? "Todo",
    due_date: t.dueDate ?? null,
    history: t.history ?? [],
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function taskFromRow(r) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    assigneeId: r.assignee_id,
    assigneeName: r.assignee_name,
    department: r.department,
    priority: r.priority,
    status: r.status,
    dueDate: r.due_date,
    history: r.history ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function payslipToRow(p) {
  return {
    id: p.id,
    employee_id: p.employeeId,
    employee_name: p.employeeName ?? "",
    department: p.department ?? "",
    designation: p.designation ?? "",
    month: p.month,
    currency: p.currency ?? "INR",
    basic: p.basic ?? 0,
    hra: p.hra ?? 0,
    allowances: p.allowances ?? 0,
    bonus: p.bonus ?? 0,
    pf: p.pf ?? 0,
    esi: p.esi ?? 0,
    tds: p.tds ?? 0,
    other_deductions: p.otherDeductions ?? 0,
    earnings: p.earnings ?? 0,
    deductions: p.deductions ?? 0,
    net_pay: p.netPay ?? 0,
    status: p.status ?? "Generated",
    notes: p.notes ?? "",
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function payslipFromRow(r) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    department: r.department,
    designation: r.designation,
    month: r.month,
    currency: r.currency,
    basic: Number(r.basic),
    hra: Number(r.hra),
    allowances: Number(r.allowances),
    bonus: Number(r.bonus),
    pf: Number(r.pf),
    esi: Number(r.esi),
    tds: Number(r.tds),
    otherDeductions: Number(r.other_deductions),
    earnings: Number(r.earnings),
    deductions: Number(r.deductions),
    netPay: Number(r.net_pay),
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function leadToRow(l) {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    company: l.company ?? "",
    phone: l.phone ?? "",
    message: l.message ?? "",
    source: l.source ?? "",
    status: l.status ?? "New",
    created_at: l.createdAt,
  };
}

function leadFromRow(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    phone: r.phone,
    message: r.message,
    source: r.source,
    status: r.status,
    createdAt: r.created_at,
  };
}

function notificationToRow(n) {
  return {
    id: n.id,
    scope: n.scope,
    recipient_id: n.recipientId ?? null,
    severity: n.severity ?? "info",
    category: n.category ?? "system",
    title: n.title ?? "",
    message: n.message ?? "",
    read: Boolean(n.read),
    created_at: n.createdAt,
  };
}

function notificationFromRow(r) {
  return {
    id: r.id,
    scope: r.scope,
    recipientId: r.recipient_id,
    severity: r.severity,
    category: r.category,
    title: r.title,
    message: r.message,
    read: r.read,
    createdAt: r.created_at,
  };
}

/** @returns {Promise<object|null>} Snapshot matching db.json shape */
export async function loadStateFromTables() {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const [
    employeesRows,
    attendanceRows,
    shiftRows,
    leaveRows,
    taskRows,
    payslipRows,
    leadRows,
    notificationRows,
    orgRows,
    anomalyRows,
  ] = await Promise.all([
    restGet(cfg, "hrms_employees", "?select=*&order=id.asc"),
    restGet(cfg, "hrms_attendance", "?select=*"),
    restGet(cfg, "hrms_employee_shifts", "?select=*"),
    restGet(cfg, "hrms_leave_requests", "?select=*&order=created_at.desc"),
    restGet(cfg, "hrms_tasks", "?select=*&order=created_at.desc"),
    restGet(cfg, "hrms_payslips", "?select=*&order=created_at.desc"),
    restGet(cfg, "hrms_leads", "?select=*&order=created_at.desc"),
    restGet(cfg, "hrms_notifications", "?select=*&order=created_at.desc"),
    restGet(cfg, "hrms_org_settings", "?select=settings&id=eq.org"),
    restGet(cfg, "hrms_anomaly_flags", "?select=*"),
  ]);

  if (employeesRows === null) return null;

  const attendance = {};
  if (Array.isArray(attendanceRows)) {
    for (const row of attendanceRows) {
      const key = `${row.date_key}:${row.employee_id}`;
      attendance[key] = {
        dateKey: row.date_key,
        employeeId: row.employee_id,
        events: row.events ?? [],
        ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
      };
    }
  }

  const employeeShift = {};
  if (Array.isArray(shiftRows)) {
    for (const row of shiftRows) {
      employeeShift[row.employee_id] = row.shift_id;
    }
  }

  const anomalyEmitted = {};
  if (Array.isArray(anomalyRows)) {
    for (const row of anomalyRows) {
      if (row.emitted) anomalyEmitted[row.flag_key] = true;
    }
  }

  let orgSettings = null;
  if (Array.isArray(orgRows) && orgRows[0]?.settings) {
    orgSettings = orgRows[0].settings;
  }

  return {
    employees: Array.isArray(employeesRows) ? employeesRows.map(employeeFromRow) : [],
    attendance,
    employeeShift,
    leaveRequests: Array.isArray(leaveRows) ? leaveRows.map(leaveFromRow) : [],
    tasks: Array.isArray(taskRows) ? taskRows.map(taskFromRow) : [],
    payslips: Array.isArray(payslipRows) ? payslipRows.map(payslipFromRow) : [],
    leads: Array.isArray(leadRows) ? leadRows.map(leadFromRow) : [],
    notifications: Array.isArray(notificationRows)
      ? notificationRows.map(notificationFromRow)
      : [],
    anomalyEmitted,
    orgSettings,
  };
}

/** Persist snapshot to normalized tables (upsert). */
export async function saveStateToTables(snapshot) {
  const cfg = supabaseConfig();
  if (!cfg) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");

  const employees = Array.isArray(snapshot.employees) ? snapshot.employees : [];
  await restUpsert(cfg, "hrms_employees", employees.map(employeeToRow), "id");

  const shiftEntries =
    snapshot.employeeShift && typeof snapshot.employeeShift === "object"
      ? Object.entries(snapshot.employeeShift)
      : [];
  if (shiftEntries.length) {
    const now = new Date().toISOString();
    await restUpsert(
      cfg,
      "hrms_employee_shifts",
      shiftEntries.map(([employee_id, shift_id]) => ({
        employee_id,
        shift_id: String(shift_id),
        updated_at: now,
      })),
      "employee_id"
    );
  }

  const attendanceEntries =
    snapshot.attendance && typeof snapshot.attendance === "object"
      ? Object.entries(snapshot.attendance)
      : [];
  if (attendanceEntries.length) {
    const attRows = attendanceEntries.map(([key, val]) => {
      const [date_key, employee_id] = key.includes(":")
        ? key.split(":")
        : [val?.dateKey, val?.employeeId];
      const { events, dateKey, employeeId, ...meta } = val || {};
      return {
        date_key: date_key || dateKey,
        employee_id: employee_id || employeeId,
        events: events ?? [],
        metadata: meta,
        updated_at: new Date().toISOString(),
      };
    });
    await restUpsert(cfg, "hrms_attendance", attRows, "date_key,employee_id");
  }

  const leaveRequests = Array.isArray(snapshot.leaveRequests) ? snapshot.leaveRequests : [];
  if (leaveRequests.length) {
    await restUpsert(cfg, "hrms_leave_requests", leaveRequests.map(leaveToRow), "id");
  }

  const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : [];
  if (tasks.length) {
    await restUpsert(cfg, "hrms_tasks", tasks.map(taskToRow), "id");
  }

  const payslips = Array.isArray(snapshot.payslips) ? snapshot.payslips : [];
  if (payslips.length) {
    await restUpsert(cfg, "hrms_payslips", payslips.map(payslipToRow), "id");
  }

  const leads = Array.isArray(snapshot.leads) ? snapshot.leads : [];
  if (leads.length) {
    await restUpsert(cfg, "hrms_leads", leads.map(leadToRow), "id");
  }

  const notifications = Array.isArray(snapshot.notifications) ? snapshot.notifications : [];
  if (notifications.length) {
    await restUpsert(cfg, "hrms_notifications", notifications.map(notificationToRow), "id");
  }

  if (snapshot.orgSettings && typeof snapshot.orgSettings === "object") {
    await restUpsert(
      cfg,
      "hrms_org_settings",
      [
        {
          id: "org",
          settings: snapshot.orgSettings,
          updated_at: new Date().toISOString(),
        },
      ],
      "id"
    );
  }

  const anomalyEmitted =
    snapshot.anomalyEmitted && typeof snapshot.anomalyEmitted === "object"
      ? snapshot.anomalyEmitted
      : {};
  const flagRows = Object.entries(anomalyEmitted).map(([flag_key, emitted]) => ({
    flag_key,
    emitted: Boolean(emitted),
    updated_at: new Date().toISOString(),
  }));
  if (flagRows.length) {
    await restUpsert(cfg, "hrms_anomaly_flags", flagRows, "flag_key");
  }
}

export function useRelationalTables() {
  if (process.env.HRMS_USE_RELATIONAL_TABLES === "false") return false;
  if (process.env.HRMS_USE_RELATIONAL_TABLES === "true") return true;
  return Boolean(supabaseConfig());
}
