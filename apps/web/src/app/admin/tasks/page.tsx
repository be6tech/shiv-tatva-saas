"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import * as React from "react";
import { Plus, RefreshCw, Sparkles } from "lucide-react";

type ApiEmployee = {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  email?: string;
};

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

export default function AdminTasksPage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<TaskRow[]>([]);
  const [employees, setEmployees] = React.useState<ApiEmployee[]>([]);

  const [assigneeId, setAssigneeId] = React.useState<string>("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch<{ tasks: TaskRow[] }>("/admin/tasks", { token: auth.token }),
      apiFetch<{ employees: ApiEmployee[] }>("/admin/employees", { token: auth.token }),
    ])
      .then(([t, e]) => {
        setRows(t.tasks ?? []);
        setEmployees(e.employees ?? []);
        if ((e.employees ?? []).length && !assigneeId) setAssigneeId(e.employees[0]!.id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token, assigneeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = React.useCallback(() => {
    if (!auth.token) return;
    setCreating(true);
    setError(null);
    apiFetch<{ ok: boolean; task: TaskRow }>("/admin/tasks/create", {
      method: "POST",
      token: auth.token,
      body: JSON.stringify({ title, description, assigneeId, priority, dueDate }),
    })
      .then(() => {
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("Medium");
        load();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to create task"))
      .finally(() => setCreating(false));
  }, [auth.token, title, description, assigneeId, priority, dueDate, load]);

  const pending = rows.filter((r) => r.status !== "Done").length;

  return (
    <DashboardShell role="admin" title="Tasks">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className={cn("lg:col-span-4", marketingSurface, "p-6")}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-700 dark:text-slate-200/80 ring-1 ring-border bg-muted/50 dark:bg-white/5 dark:ring-white/10">
            <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
            Workflow Module
          </div>
          <div className="mt-4 text-xl font-semibold">Assign Tasks</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
            Create and assign action items to employees. Employees can update progress in their portal.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            <select
              className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
              {!employees.length ? <option value="">No employees loaded</option> : null}
            </select>
            <input
              className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="min-h-24 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 py-3 text-sm outline-none focus:ring-[#f97316]/40"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {["Low", "Medium", "High", "Urgent"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={create}
              disabled={creating || title.trim().length < 3}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating…" : "Create Task"}
            </button>
          </div>
          <div className="mt-6 rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
            <div className="text-xs text-slate-600 dark:text-slate-400">Open tasks</div>
            <div className="mt-1 text-base font-semibold">{loading ? "…" : pending}</div>
          </div>
        </div>

        <div className={cn("lg:col-span-8", marketingSurface, "overflow-hidden p-0")}>
          <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Task Board</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">All assigned tasks (persisted).</div>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-muted/50 dark:bg-white/5">
                <tr className="text-left text-slate-800 dark:text-slate-200/85">
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{r.title}</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.id}</div>
                      {r.description ? (
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">“{r.description}”</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.assigneeName}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.department}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.priority}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.dueDate ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={6}>
                      No tasks created yet.
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

