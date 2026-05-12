"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { formatDateKey } from "@/lib/time";
import { computeDurations, msToHhMm, statusFromEvents } from "@/features/attendance/logic";
import type { AttendanceDay } from "@/features/attendance/types";
import * as React from "react";
import { Download, Filter, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

const STORAGE_KEY = "shivtatva.attendance.v1";

type LiveStatusRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  designation?: string;
  status: string;
  lastAt: string | null;
  online?: boolean;
  late?: boolean;
  lateMinutes?: number;
  overtimeMinutes?: number;
  shift?: { id: string; name: string; start: string; end: string };
};

type ShiftInfo = { id: string; name: string; start: string; end: string };

function loadAll(): AttendanceDay[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as Record<string, AttendanceDay>;
    return Object.values(store);
  } catch {
    return [];
  }
}

export default function AdminAttendancePage() {
  const today = formatDateKey(new Date());
  const auth = useAuth();
  const [rows, setRows] = React.useState<AttendanceDay[]>(() =>
    loadAll().filter((r) => r.dateKey === today)
  );
  const [live, setLive] = React.useState<LiveStatusRow[]>([]);
  const [shifts, setShifts] = React.useState<ShiftInfo[]>([]);
  const [assigning, setAssigning] = React.useState(false);
  const [dept, setDept] = React.useState<string>("All");
  const refresh = React.useCallback(() => {
    if (auth.hydrated && auth.token) {
      apiFetch<{ days: AttendanceDay[] }>("/admin/attendance/today", {
        token: auth.token,
      })
        .then((r) => setRows(r.days ?? []))
        .catch(() => setRows(loadAll().filter((r) => r.dateKey === today)));
      return;
    }
    setRows(loadAll().filter((r) => r.dateKey === today));
  }, [auth.hydrated, auth.token, today]);

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.hydrated, auth.token, today]);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    let cancelled = false;
    const load = async () => {
      try {
        const r = await apiFetch<{ rows: LiveStatusRow[] }>("/admin/live-status", {
          token: auth.token,
        });
        if (!cancelled) setLive(r.rows ?? []);
      } catch {
        if (!cancelled) setLive([]);
      }
    };
    load();
    const t = window.setInterval(load, 5000);
    apiFetch<{ shifts: ShiftInfo[] }>("/admin/shifts", { token: auth.token })
      .then((r) => setShifts(r.shifts ?? []))
      .catch(() => setShifts([]));
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [auth.hydrated, auth.token, today]);

  const departments = React.useMemo(() => {
    const set = new Set(rows.map((r) => r.department));
    return ["All", ...Array.from(set).sort()];
  }, [rows]);

  const liveById = React.useMemo(() => {
    const m = new Map<string, LiveStatusRow>();
    for (const r of live) m.set(r.employeeId, r);
    return m;
  }, [live]);

  const filtered = rows.filter((r) => (dept === "All" ? true : r.department === dept));

  const exportCsv = React.useCallback(() => {
    const header = [
      "Employee Name",
      "Employee ID",
      "Department",
      "Shift",
      "Online",
      "Late (min)",
      "Overtime (min)",
      "Check In",
      "Lunch In",
      "Lunch Out",
      "Break In",
      "Break Out",
      "Check Out",
      "Total Working Hours",
      "Status",
    ];

    const getTime = (r: AttendanceDay, t: string) => {
      const at = r.events.find((e) => e.type === t)?.at;
      return at
        ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
    };

    const lines = filtered.map((r) => {
      const status = statusFromEvents(r.events);
      const dur = computeDurations(r.events);
      const liveRow = liveById.get(r.employeeId);
      const shiftLabel = liveRow?.shift
        ? `${liveRow.shift.name} (${liveRow.shift.start}–${liveRow.shift.end})`
        : "";
      const row = [
        r.employeeName,
        r.employeeId,
        r.department,
        shiftLabel,
        liveRow?.online ? "Yes" : "No",
        liveRow?.lateMinutes ?? "",
        liveRow?.overtimeMinutes ?? "",
        getTime(r, "CHECK_IN"),
        getTime(r, "LUNCH_IN"),
        getTime(r, "LUNCH_OUT"),
        getTime(r, "BREAK_IN"),
        getTime(r, "BREAK_OUT"),
        getTime(r, "CHECK_OUT"),
        msToHhMm(dur.netWorkMs),
        status,
      ];
      return row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered, liveById, today]);

  return (
    <DashboardShell role="admin" title="Attendance Management">
      <div className={cn(marketingSurface, "p-6")}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-300/80">Admin Attendance Table</div>
            <div className="mt-1 text-xl font-semibold">
              Live status • productivity • overtime (demo data)
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
              This view reads the same demo attendance events stored in the browser.
              When backend is enabled, it will load from APIs and support exports.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
              <Filter className="h-4 w-4 text-[#f97316]" />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-slate-950">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
            >
              <RefreshCw className="h-4 w-4 text-[#f97316]" />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#f97316] to-[#fb923c]"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {auth.hydrated && auth.token ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <div className={cn("lg:col-span-8", marketingSurface, "p-6")}>
            <div className="text-base font-semibold">Live Employee Status</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">
              Working / Lunch / Break / Offline / Checked Out (server-calculated).
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {live.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  No live rows yet. Create events from Employee Attendance.
                </div>
              ) : (
                live.map((r) => (
                  <div key={r.employeeId} className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{r.employeeName}</div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {r.employeeId} • {r.department}
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
                        <span
                          className="mr-2 h-2 w-2 rounded-full"
                          style={{
                            background: r.online ? "#10B981" : "#94A3B8",
                            boxShadow: r.online
                              ? "0 0 18px rgba(16,185,129,.35)"
                              : "0 0 18px rgba(148,163,184,.2)",
                          }}
                        />
                        {r.status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                      Shift:{" "}
                      <span className="text-slate-800 dark:text-slate-200/85">
                        {r.shift?.name} ({r.shift?.start}–{r.shift?.end})
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.late ? (
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-[#F59E0B]/15 text-[#ffd08a] ring-1 ring-[#F59E0B]/25">
                          Late ({r.lateMinutes ?? 0}m)
                        </span>
                      ) : null}
                      {(r.overtimeMinutes ?? 0) > 0 ? (
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-[#f97316]/15 text-[#ffb26b] ring-1 ring-[#f97316]/25">
                          Overtime ({r.overtimeMinutes}m)
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      Last activity:{" "}
                      <span className="text-slate-800 dark:text-slate-200/85">
                        {r.lastAt ? new Date(r.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={cn("lg:col-span-4", marketingSurface, "p-6")}>
            <div className="text-base font-semibold">Shift Management</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">
              Assign shifts per employee (demo store).
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400">Employee</div>
                <div className="mt-1 text-sm font-semibold">ST-EMP-001</div>
              </div>
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400">Shift</div>
                <select
                  className="mt-2 h-11 w-full rounded-2xl bg-slate-950/40 ring-1 ring-white/10 px-4 text-sm outline-none"
                  onChange={async (e) => {
                    if (!auth.token) return;
                    setAssigning(true);
                    try {
                      await apiFetch<{ ok: boolean }>("/admin/shifts/assign", {
                        method: "POST",
                        token: auth.token,
                        body: JSON.stringify({ employeeId: "ST-EMP-001", shiftId: e.target.value }),
                      });
                      const r = await apiFetch<{ rows: any[] }>("/admin/live-status", { token: auth.token });
                      setLive(r.rows ?? []);
                    } finally {
                      setAssigning(false);
                    }
                  }}
                  defaultValue={shifts?.[0]?.id}
                  disabled={assigning || shifts.length === 0}
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-950">
                      {s.name} ({s.start}–{s.end})
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {assigning ? "Assigning…" : " "}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn(marketingSurface, "mt-4 overflow-hidden p-0")}>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-muted/50 dark:bg-white/5">
              <tr className="text-left text-slate-800 dark:text-slate-200/85">
                <th className="px-5 py-4">Employee Name</th>
                <th className="px-5 py-4">Employee ID</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Shift</th>
                <th className="px-5 py-4">Online</th>
                <th className="px-5 py-4">Late</th>
                <th className="px-5 py-4">Overtime</th>
                <th className="px-5 py-4">Check In</th>
                <th className="px-5 py-4">Lunch In</th>
                <th className="px-5 py-4">Lunch Out</th>
                <th className="px-5 py-4">Break In</th>
                <th className="px-5 py-4">Break Out</th>
                <th className="px-5 py-4">Check Out</th>
                <th className="px-5 py-4">Total Working</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-slate-600 dark:text-slate-400" colSpan={15}>
                    No attendance rows yet. Create events from the Employee Attendance page.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const get = (t: string) =>
                    r.events.find((e) => e.type === t)?.at
                      ? new Date(r.events.find((e) => e.type === t)!.at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—";
                  const status = statusFromEvents(r.events);
                  const dur = computeDurations(r.events);
                  const liveRow = liveById.get(r.employeeId);
                  return (
                    <tr key={`${r.dateKey}:${r.employeeId}`} className="border-t border-white/10">
                      <td className="px-5 py-4 font-semibold">{r.employeeName}</td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200/85">{r.employeeId}</td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200/85">{r.department}</td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200/85">
                        {liveRow?.shift ? (
                          <span className="text-xs">
                            {liveRow.shift.name} ({liveRow.shift.start}–{liveRow.shift.end})
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: liveRow?.online ? "#10B981" : "#94A3B8",
                              boxShadow: liveRow?.online
                                ? "0 0 18px rgba(16,185,129,.35)"
                                : "0 0 18px rgba(148,163,184,.2)",
                            }}
                          />
                          {liveRow?.online ? "Online" : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {(liveRow?.lateMinutes ?? 0) > 0 ? (
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-[#F59E0B]/15 text-[#ffd08a] ring-1 ring-[#F59E0B]/25">
                            {liveRow?.lateMinutes}m
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {(liveRow?.overtimeMinutes ?? 0) > 0 ? (
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-[#f97316]/15 text-[#ffb26b] ring-1 ring-[#f97316]/25">
                            {liveRow?.overtimeMinutes}m
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4">{get("CHECK_IN")}</td>
                      <td className="px-5 py-4">{get("LUNCH_IN")}</td>
                      <td className="px-5 py-4">{get("LUNCH_OUT")}</td>
                      <td className="px-5 py-4">{get("BREAK_IN")}</td>
                      <td className="px-5 py-4">{get("BREAK_OUT")}</td>
                      <td className="px-5 py-4">{get("CHECK_OUT")}</td>
                      <td className="px-5 py-4 font-semibold">{msToHhMm(dur.netWorkMs)}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
                          <span
                            className="mr-2 h-2 w-2 rounded-full"
                            style={{
                              background:
                                status === "Working"
                                  ? "#10B981"
                                  : status === "Offline"
                                  ? "#EF4444"
                                  : status === "Checked Out"
                                  ? "#94A3B8"
                                  : "#F59E0B",
                              boxShadow:
                                status === "Working"
                                  ? "0 0 18px rgba(16,185,129,.35)"
                                  : status === "Offline"
                                  ? "0 0 18px rgba(239,68,68,.25)"
                                  : "0 0 18px rgba(249,115,22,.25)",
                            }}
                          />
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

