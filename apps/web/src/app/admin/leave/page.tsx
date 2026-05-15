"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ClipboardList, Sparkles } from "lucide-react";
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

export default function AdminLeavePage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<LeaveRequest[]>([]);
  const [status, setStatus] = React.useState<
    LeaveRequest["status"] | "All"
  >("Pending");
  const [note, setNote] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    const qs = status === "All" ? "" : `?status=${encodeURIComponent(status)}`;
    apiFetch<{ requests: LeaveRequest[] }>(`/admin/leave/requests${qs}`, { token: auth.token })
      .then((r) => setRows(r.requests ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load requests"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  const decide = React.useCallback(
    (id: string, decision: "approve" | "reject") => {
      if (!auth.token) return;
      setBusyId(id);
      setError(null);
      apiFetch<{ ok: boolean; request: LeaveRequest }>(`/admin/leave/requests/${id}/decision`, {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({ decision, note: (note[id] ?? "").trim() }),
      })
        .then(() => load())
        .catch((e) => setError(e instanceof Error ? e.message : "Failed to update request"))
        .finally(() => setBusyId(null));
    },
    [auth.token, note, load]
  );

  const pendingCount = rows.filter((r) => r.status === "Pending").length;

  return (
    <DashboardShell role="admin" title="Leave Management">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4 glass rounded-3xl p-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-700 dark:text-slate-200/80 ring-1 ring-border bg-muted/50 dark:bg-white/5 dark:ring-white/10">
            <Sparkles className="h-3.5 w-3.5 text-[#F57C00]" />
            HRMS Module
          </div>
          <div className="mt-4 text-xl font-semibold">Approvals & Policies</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
            Review leave requests, enforce policies, and audit approvals. Data is persisted locally for this demo.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4 text-[#F57C00]" />
                Pending Approvals
              </div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">{loading ? "…" : pendingCount}</div>
            </div>
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-sm font-semibold">Status Filter</div>
              <select
                className="form-select mt-3 w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                {["Pending", "Approved", "Rejected", "Cancelled", "All"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={load}
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 glass rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <div className="text-base font-semibold">Leave Requests</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">Approve or reject requests with a note for audit.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-muted/50 dark:bg-white/5">
                <tr className="text-left text-slate-800 dark:text-slate-200/85">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">From</th>
                  <th className="px-6 py-4">To</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Decision</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10 align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{r.employeeName}</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.employeeId}</div>
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">“{r.reason}”</div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.department}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.type}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.from}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.to}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.durationDays}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                          r.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-800 ring-emerald-500/30 dark:text-emerald-200 dark:ring-emerald-500/20"
                            : r.status === "Rejected"
                              ? "bg-red-500/10 text-red-800 ring-red-500/30 dark:text-red-200 dark:ring-red-500/20"
                              : "bg-muted/50 dark:bg-white/5 text-slate-700 dark:text-slate-200/80 ring-border dark:ring-white/10",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.status === "Pending" ? (
                        <div className="space-y-2">
                          <input
                            className="h-10 w-full rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                            placeholder="Optional note"
                            value={note[r.id] ?? ""}
                            onChange={(e) => setNote((n) => ({ ...n, [r.id]: e.target.value }))}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => decide(r.id, "approve")}
                              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold text-emerald-100 bg-emerald-500/10 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15 transition disabled:opacity-60"
                            >
                              {busyId === r.id ? "…" : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => decide(r.id, "reject")}
                              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold text-red-100 bg-red-500/10 ring-1 ring-red-500/20 hover:bg-red-500/15 transition disabled:opacity-60"
                            >
                              {busyId === r.id ? "…" : "Reject"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 dark:text-slate-400">Decision recorded</div>
                      )}
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={8}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={8}>
                      No leave requests.
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

