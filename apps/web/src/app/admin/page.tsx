"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import { Users, CalendarClock, BarChart3, Bell, UserPlus } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type LiveMetrics = { late: number; overtime: number; online: number };
type LeaveRow = { id: string; status: string };
type TaskRow = { id: string; status: string };
type PayslipRow = { id: string; month: string; netPay: number };

export default function AdminDashboard() {
  const auth = useAuth();
  const [metrics, setMetrics] = React.useState<LiveMetrics>({ late: 0, overtime: 0, online: 0 });
  const [pendingLeaves, setPendingLeaves] = React.useState(0);
  const [openTasks, setOpenTasks] = React.useState(0);
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);
  const [payslipsCount, setPayslipsCount] = React.useState(0);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    Promise.all([
      apiFetch<LiveMetrics>("/admin/attendance/metrics", { token: auth.token }),
      apiFetch<{ requests: LeaveRow[] }>("/admin/leave/requests?status=Pending", { token: auth.token }),
      apiFetch<{ tasks: TaskRow[] }>("/admin/tasks", { token: auth.token }),
      apiFetch<{ items: any[] }>("/notifications?unreadOnly=true&limit=200", { token: auth.token }),
      apiFetch<{ payslips: PayslipRow[] }>("/admin/payslips", { token: auth.token }),
    ])
      .then(([m, l, t, n, p]) => {
        setMetrics({ late: m.late ?? 0, overtime: m.overtime ?? 0, online: m.online ?? 0 });
        setPendingLeaves((l.requests ?? []).length);
        setOpenTasks((t.tasks ?? []).filter((x) => x.status !== "Done").length);
        setUnreadNotifs((n.items ?? []).length);
        setPayslipsCount((p.payslips ?? []).length);
      })
      .catch(() => {
        setMetrics({ late: 0, overtime: 0, online: 0 });
        setPendingLeaves(0);
        setOpenTasks(0);
        setUnreadNotifs(0);
        setPayslipsCount(0);
      });
  }, [auth.hydrated, auth.token]);

  return (
    <DashboardShell role="admin" title="Dashboard">
      <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <div className="text-sm text-slate-600 dark:text-slate-300/80">
              Welcome back{auth.userId?.includes("@") ? `, ${auth.userId}` : ""}
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              Admin Command Center
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
              Monitor workforce status, attendance reports, payroll summaries, and actionable alerts.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Online now", value: metrics.online },
                { label: "Late today", value: metrics.late },
                { label: "Overtime today", value: metrics.overtime },
                { label: "Unread alerts", value: unreadNotifs },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">{k.label}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{k.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/admin/onboarding", label: "Onboarding", icon: UserPlus, desc: "New hire documents • ID proofs • offer letter" },
              { href: "/admin/employees", label: "Employees", icon: Users, desc: "Directory • departments • roles" },
              { href: "/admin/attendance", label: "Attendance", icon: CalendarClock, desc: "Live status • exports • overtime" },
              { href: "/admin/analytics", label: "Analytics", icon: BarChart3, desc: "Daily attendance • productivity • trends" },
              { href: "/admin/notifications", label: "Notifications", icon: Bell, desc: "System alerts • approvals • tasks" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="glass rounded-3xl p-6 hover:bg-muted dark:hover:bg-white/[0.07] transition">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 flex items-center justify-center">
                    <c.icon className="h-5 w-5 text-[#F57C00]" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#F57C00] shadow-[0_0_18px_rgba(245,124,0,.6)]" />
                </div>
                <div className="mt-4 text-base font-semibold text-foreground">{c.label}</div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">{c.desc}</div>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Pending leave approvals", value: pendingLeaves, href: "/admin/leave" },
              { label: "Open tasks", value: openTasks, href: "/admin/tasks" },
              { label: "Payslips generated", value: payslipsCount, href: "/admin/payroll" },
            ].map((k) => (
              <Link
                key={k.label}
                href={k.href}
                className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-6 hover:bg-muted dark:hover:bg-white/[0.07] transition"
              >
                <div className="text-xs text-slate-600 dark:text-slate-400">{k.label}</div>
                <div className="mt-2 text-xl font-semibold text-foreground">{k.value}</div>
              </Link>
            ))}
          </div>
      </div>
    </DashboardShell>
  );
}

