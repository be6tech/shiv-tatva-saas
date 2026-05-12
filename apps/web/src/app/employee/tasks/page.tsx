"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
type TaskStatus = "Todo" | "InProgress" | "Done" | "Blocked";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  department: string;
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export default function EmployeeTasksPage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<TaskRow[]>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    apiFetch<{ tasks: TaskRow[] }>("/employee/tasks/mine", { token: auth.token })
      .then((r) => setRows(r.tasks ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const setStatus = React.useCallback(
    (id: string, status: TaskStatus) => {
      if (!auth.token) return;
      setBusyId(id);
      setError(null);
      apiFetch<{ ok: boolean; task: TaskRow }>(`/employee/tasks/${id}/status`, {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({ status }),
      })
        .then(() => load())
        .catch((e) => setError(e instanceof Error ? e.message : "Failed to update status"))
        .finally(() => setBusyId(null));
    },
    [auth.token, load]
  );

  return (
    <DashboardShell role="employee" title="Tasks">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4 glass rounded-3xl p-6">
          <div className="text-base font-semibold">Task Tracking</div>
          <p className="mt-2 text-sm text-slate-300/85">
            Update your task status. Changes are saved and visible to Admin.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          <button
            type="button"
            onClick={load}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Todo", value: rows.filter((r) => r.status === "Todo").length },
              { label: "In Progress", value: rows.filter((r) => r.status === "InProgress").length },
              { label: "Blocked", value: rows.filter((r) => r.status === "Blocked").length },
              { label: "Done", value: rows.filter((r) => r.status === "Done").length },
            ].map((c) => (
              <div key={c.label} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <div className="text-xs text-slate-300/70">{c.label}</div>
                <div className="mt-1 text-sm font-semibold">{loading ? "…" : c.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 glass rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <div className="text-base font-semibold">My Tasks</div>
            <div className="mt-1 text-sm text-slate-300/85">Assigned by Admin.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left text-slate-200/85">
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10 align-top">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="mt-1 text-xs text-slate-300/70">{r.id}</div>
                      {r.description ? (
                        <div className="mt-2 text-xs text-slate-300/70 line-clamp-2">“{r.description}”</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-slate-200/85">{r.priority}</td>
                    <td className="px-6 py-4 text-slate-200/85">{r.dueDate ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-white/5 ring-1 ring-white/10">
                        {r.status === "Done" ? (
                          <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                        ) : (
                          <ClipboardList className="h-4 w-4 text-[#F57C00]" />
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(["Todo", "InProgress", "Blocked", "Done"] as TaskStatus[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={busyId === r.id || r.status === s}
                            onClick={() => setStatus(r.id, s)}
                            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {busyId === r.id ? "…" : s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-300/70" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-300/70" colSpan={5}>
                      No tasks assigned yet.
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

