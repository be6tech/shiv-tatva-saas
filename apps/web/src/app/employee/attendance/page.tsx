"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAttendance } from "@/features/attendance/useAttendance";
import {
  computeDurations,
  msToHhMm,
  statusFromEvents,
} from "@/features/attendance/logic";
import { formatTime } from "@/lib/time";
import * as React from "react";
import { motion } from "framer-motion";
import { CalendarClock, Timer, Activity, RotateCcw } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";

const labels = {
  CHECK_IN: "Check In",
  CHECK_OUT: "Check Out",
  LUNCH_IN: "Lunch In",
  LUNCH_OUT: "Lunch Out",
  BREAK_IN: "Break In",
  BREAK_OUT: "Break Out",
} as const;

export default function EmployeeAttendancePage() {
  const auth = useAuth();
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const attendance = useAttendance({
    employeeId: "ST-EMP-001",
    employeeName: "Demo Employee",
    department: "Engineering",
  });

  const events = attendance.day?.events ?? [];
  const status = statusFromEvents(events);
  const d = computeDurations(events);

  return (
    <DashboardShell role="employee" title="Attendance">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className={cn(marketingSurface, "p-6")}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-200/80 ring-1 ring-white/10 bg-white/5">
                  <CalendarClock className="h-3.5 w-3.5 text-[#f97316]" />
                  {attendance.dateKey} • Live Attendance
                </div>
                <div className="mt-2 text-xs text-slate-300/70">
                  Data source: <span className="text-slate-200/85">{attendance.source}</span>
                </div>
                {attendance.shift ? (
                  <div className="mt-2 text-xs text-slate-300/70">
                    Shift:{" "}
                    <span className="text-slate-200/85">
                      {attendance.shift.name} ({attendance.shift.start}–{attendance.shift.end})
                    </span>
                  </div>
                ) : null}
                <div className="mt-3 text-2xl font-semibold">{formatTime(now)}</div>
                <div className="mt-1 text-sm text-slate-300/85">
                  Status:{" "}
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-white/5 ring-1 ring-white/10">
                    <span
                      className="mr-2 h-2 w-2 rounded-full"
                      style={{
                        background:
                          status === "Working"
                            ? "#10B981"
                            : status === "On Lunch"
                            ? "#F59E0B"
                            : status === "On Break"
                            ? "#F59E0B"
                            : status === "Checked Out"
                            ? "#94A3B8"
                            : "#EF4444",
                        boxShadow:
                          status === "Working"
                            ? "0 0 18px rgba(16,185,129,.45)"
                            : status === "Offline"
                            ? "0 0 18px rgba(239,68,68,.35)"
                            : "0 0 18px rgba(249,115,22,.35)",
                      }}
                    />
                    {status}
                  </span>
                </div>
                {attendance.apiError ? (
                  <div className="mt-3 text-xs text-red-200/90">
                    {attendance.apiError}
                  </div>
                ) : null}
                {auth.role === "admin" ? (
                  <div className="mt-3 text-xs text-slate-300/70">
                    Admin override: you can force Check In even outside shift window.
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className={cn(marketingSurface, "p-4")}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300/70">Net Work</div>
                    <Timer className="h-4 w-4 text-[#f97316]" />
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {msToHhMm(d.netWorkMs)}
                  </div>
                </div>
                <div className={cn(marketingSurface, "p-4")}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300/70">Lunch</div>
                    <Activity className="h-4 w-4 text-[#f97316]" />
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {msToHhMm(d.lunchMs)}
                  </div>
                </div>
                <div className={cn(marketingSurface, "p-4")}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300/70">Break</div>
                    <Activity className="h-4 w-4 text-[#f97316]" />
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {msToHhMm(d.breakMs)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(marketingSurface, "p-6")}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Actions</div>
                <div className="mt-1 text-sm text-slate-300/80">
                  Available actions adapt to the attendance flow.
                </div>
              </div>
              <button
                type="button"
                onClick={attendance.resetToday}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white/90 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                <RotateCcw className="h-4 w-4" />
                Reset (demo)
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                (attendance.allowed.length
                  ? attendance.allowed
                  : ["CHECK_IN"]) as typeof attendance.allowed
              ).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => attendance.addEvent(t)}
                  disabled={!attendance.allowed.includes(t)}
                  className="relative overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#0B1F3A] to-[#1a2f52] ring-1 ring-white/10 hover:from-[#f97316] hover:to-[#fb923c]"
                >
                  {labels[t as keyof typeof labels]}
                </button>
              ))}
            </div>

            {auth.role === "admin" && attendance.source === "api" ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => attendance.addEventOverride("CHECK_IN")}
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  Force Check In (override)
                </button>
              </div>
            ) : null}

            {auth.role === "admin" &&
            attendance.source === "api" &&
            attendance.apiErrorCode === "outside_shift_window" ? (
              <div className="mt-3 text-xs text-slate-300/80">
                The server blocked check-in due to shift window. Use override if required.
              </div>
            ) : null}
          </div>

          <div className={cn(marketingSurface, "p-6")}>
            <div className="text-base font-semibold">Attendance Timeline</div>
            <div className="mt-4 space-y-3">
              {events.length === 0 ? (
                <div className="text-sm text-slate-300/80">
                  No events yet. Start with{" "}
                  <span className="text-white">Check In</span>.
                </div>
              ) : (
                events.map((e, idx) => (
                  <motion.div
                    key={e.at + e.type}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4"
                  >
                    <div className="h-8 w-8 rounded-2xl bg-[#f97316]/15 ring-1 ring-[#f97316]/25" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {labels[e.type as keyof typeof labels]}
                      </div>
                      <div className="text-xs text-slate-300/70">
                        {new Date(e.at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300/70">#{idx + 1}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className={cn(marketingSurface, "p-6")}>
            <div className="text-base font-semibold">Live Work Tracking</div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Total Session</div>
                <div className="mt-1 text-sm font-semibold">
                  {msToHhMm(d.sessionMs)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Overtime (demo)</div>
                <div className="mt-1 text-sm font-semibold">
                  {d.netWorkMs > 8 * 3600_000
                    ? msToHhMm(d.netWorkMs - 8 * 3600_000)
                    : "0h 0m"}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Productivity (demo)</div>
                <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-[68%] bg-gradient-to-r from-[#f97316] to-[#ffb26b]" />
                </div>
                <div className="mt-2 text-xs text-slate-300/70">
                  68% focused time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

