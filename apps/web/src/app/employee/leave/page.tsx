"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CalendarDays, Sparkles } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: "Annual" | "Sick" | "WFH" | "CompOff" | "Unpaid";
  from: string;
  to: string;
  durationDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  createdAt: string;
  updatedAt: string;
};

export default function EmployeeLeavePage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [rows, setRows] = React.useState<LeaveRequest[]>([]);

  const [type, setType] = React.useState<LeaveRequest["type"]>("Annual");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [reason, setReason] = React.useState("");

  const loadMine = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    apiFetch<{ requests: LeaveRequest[] }>("/employee/leave/mine", { token: auth.token })
      .then((r) => setRows(r.requests ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load leave requests"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    loadMine();
  }, [loadMine]);

  const onSubmit = React.useCallback(() => {
    if (!auth.token) return;
    setSubmitting(true);
    setError(null);
    apiFetch<{ ok: boolean; request: LeaveRequest }>("/employee/leave/apply", {
      method: "POST",
      token: auth.token,
      body: JSON.stringify({ type, from, to, reason }),
    })
      .then(() => {
        setFrom("");
        setTo("");
        setReason("");
        loadMine();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to apply leave"))
      .finally(() => setSubmitting(false));
  }, [auth.token, type, from, to, reason, loadMine]);

  return (
    <DashboardShell role="employee" title="Leave Requests">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 glass rounded-3xl p-6">
          <div className="text-base font-semibold">Apply Leave</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/85">
            Submit a leave request. Admin approvals update status in real-time.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <select
              className="form-select w-full"
              value={type}
              onChange={(e) => setType(e.target.value as LeaveRequest["type"])}
            >
              {["Annual", "Sick", "WFH", "CompOff", "Unpaid"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="form-input w-full"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              className="form-input w-full"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <textarea
              className="form-textarea sm:col-span-2 w-full"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !from || !to || reason.trim().length < 3}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#F57C00] to-[#ff9a3d] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CalendarDays className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Leave Request"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">Leave Balance</div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-200/80 ring-1 ring-white/10 bg-white/5">
              <Sparkles className="h-3.5 w-3.5 text-[#F57C00]" />
              AI checks ready
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Annual", value: "10 days" },
            ].map((b) => (
              <div key={b.label} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <div className="text-xs text-slate-300/70">{b.label}</div>
                <div className="mt-1 text-sm font-semibold">{b.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-12 glass rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">My Requests</div>
              <div className="mt-1 text-sm text-slate-300/85">Status updates appear here.</div>
            </div>
            <button
              type="button"
              onClick={loadMine}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left text-slate-200/85">
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">From</th>
                  <th className="px-6 py-4">To</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-6 py-4 font-semibold">{r.id}</td>
                    <td className="px-6 py-4 text-slate-200/85">{r.type}</td>
                    <td className="px-6 py-4 text-slate-200/85">{r.from}</td>
                    <td className="px-6 py-4 text-slate-200/85">{r.to}</td>
                    <td className="px-6 py-4 text-slate-200/85">{r.durationDays}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                          r.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20"
                            : r.status === "Rejected"
                              ? "bg-red-500/10 text-red-200 ring-red-500/20"
                              : "bg-white/5 text-slate-200/80 ring-white/10",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-300/70" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-300/70" colSpan={6}>
                      No leave requests yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

