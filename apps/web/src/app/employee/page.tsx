"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import { CalendarClock, Bell, ClipboardList, Wallet, Sparkles } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type MePayload = {
  sub?: string;
  role?: string;
  org?: string;
};

export default function EmployeeDashboard() {
  const auth = useAuth();
  const [me, setMe] = React.useState<MePayload | null>(null);
  const [pendingTasks, setPendingTasks] = React.useState(0);
  const [pendingLeaves, setPendingLeaves] = React.useState(0);
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);
  const [latestPayslip, setLatestPayslip] = React.useState<{ month: string; netPay: number } | null>(null);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    apiFetch<{ me: MePayload }>("/employee/me", { token: auth.token })
      .then((r) => setMe(r.me))
      .catch(() => setMe(null));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    Promise.all([
      apiFetch<{ tasks: any[] }>("/employee/tasks/mine", { token: auth.token }),
      apiFetch<{ requests: any[] }>("/employee/leave/mine", { token: auth.token }),
      apiFetch<{ items: any[] }>("/notifications?unreadOnly=true&limit=200", { token: auth.token }),
      apiFetch<{ payslips: any[] }>("/employee/payslips/mine", { token: auth.token }),
    ])
      .then(([t, l, n, p]) => {
        const tasks = t.tasks ?? [];
        const leaves = l.requests ?? [];
        const notifs = n.items ?? [];
        const payslips = p.payslips ?? [];
        setPendingTasks(tasks.filter((x) => x.status !== "Done").length);
        setPendingLeaves(leaves.filter((x) => x.status === "Pending").length);
        setUnreadNotifs(notifs.length);
        const sorted = [...payslips].sort((a, b) => String(b.month).localeCompare(String(a.month)));
        const top = sorted[0] ?? null;
        setLatestPayslip(top ? { month: top.month, netPay: Number(top.netPay ?? 0) } : null);
      })
      .catch(() => {
        setPendingTasks(0);
        setPendingLeaves(0);
        setUnreadNotifs(0);
        setLatestPayslip(null);
      });
  }, [auth.hydrated, auth.token]);

  return (
    <DashboardShell role="employee" title="Employee Dashboard">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className={cn(marketingSurface, "p-6")}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-300/80">Welcome back</div>
                <div className="mt-1 text-xl font-semibold">Employee Self-Service</div>
                <p className="mt-2 text-sm text-slate-300/85">
                  Track attendance, request leaves, view payslips, manage tasks, and
                  get AI-powered insights.
                </p>
                <div className="mt-3 text-xs text-slate-300/70">
                  Session: {me?.sub ? me.sub : auth.userId ?? "—"} • Role:{" "}
                  {me?.role ?? auth.role ?? "—"}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-2xl px-4 py-3 bg-white/5 ring-1 ring-white/10">
                <Sparkles className="h-4 w-4 text-[#f97316]" />
                <div className="text-xs text-slate-200/80">AI Nudges Enabled</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/employee/attendance", label: "Attendance", icon: CalendarClock, desc: "Check in/out • lunch • breaks • timeline" },
              { href: "/employee/leave", label: "Leave Requests", icon: ClipboardList, desc: "Apply leave • approvals • history" },
              { href: "/employee/payslips", label: "Payslips", icon: Wallet, desc: "Salary statements • downloads" },
              { href: "/employee/notifications", label: "Notifications", icon: Bell, desc: "Updates • tasks • alerts" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className={cn(marketingSurface, "p-6 transition hover:bg-slate-50 dark:hover:bg-white/[0.07]")}>
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                    <c.icon className="h-5 w-5 text-[#f97316]" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#f97316] shadow-[0_0_18px_rgba(249,115,22,.6)]" />
                </div>
                <div className="mt-4 text-base font-semibold">{c.label}</div>
                <div className="mt-2 text-sm text-slate-300/85">{c.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className={cn(marketingSurface, "p-6")}>
            <div className="text-base font-semibold">Today</div>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Status</div>
                <div className="mt-1 text-sm font-semibold">Open Attendance to view live status</div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Pending Tasks</div>
                <div className="mt-1 text-sm font-semibold">{pendingTasks}</div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Latest Payslip</div>
                <div className="mt-1 text-sm font-semibold">
                  {latestPayslip ? `${latestPayslip.month} • ₹ ${latestPayslip.netPay.toLocaleString("en-IN")}` : "—"}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Pending Leave</div>
                <div className="mt-1 text-sm font-semibold">{pendingLeaves}</div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/70">Unread Notifications</div>
                <div className="mt-1 text-sm font-semibold">{unreadNotifs}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

