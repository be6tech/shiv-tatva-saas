"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Bell, Check, CheckCheck, Filter, Search, Sparkles, TriangleAlert } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

export default function EmployeeNotificationsPage() {
  const auth = useAuth();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [category, setCategory] = React.useState<string>("");
  const [q, setQ] = React.useState("");
  const [bulkBusy, setBulkBusy] = React.useState(false);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    const qs = new URLSearchParams();
    if (unreadOnly) qs.set("unreadOnly", "true");
    if (category) qs.set("category", category);
    apiFetch<{ items: any[] }>(`/notifications?${qs.toString()}`, { token: auth.token })
      .then((r) => setItems(r.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token, unreadOnly, category]);

  React.useEffect(() => {
    load();
  }, [load]);

  const markRead = React.useCallback(
    (id: string) => {
      if (!auth.token) return;
      apiFetch<{ ok: boolean }>(`/notifications/${id}/read`, { method: "POST", token: auth.token })
        .then(() => load())
        .catch(() => load());
    },
    [auth.token, load]
  );

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((n) =>
      [n.title ?? "", n.message ?? "", n.category ?? "", n.severity ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  const markAllRead = React.useCallback(async () => {
    if (!auth.token) return;
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) return;
    setBulkBusy(true);
    try {
      const qs = new URLSearchParams();
      if (category) qs.set("category", category);
      await apiFetch<{ ok: boolean }>(`/notifications/read-all?${qs.toString()}`, {
        method: "POST",
        token: auth.token,
      });
    } catch {
      // ignore
    } finally {
      setBulkBusy(false);
      load();
    }
  }, [auth.token, items, category, load]);

  return (
    <DashboardShell role="employee" title="Notifications">
      <div className={cn(marketingSurface, "p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold">Your Notifications</div>
            <p className="mt-2 text-sm text-slate-300/85">
              Updates about leave, tasks, attendance, and payroll. Persisted and protected by JWT.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUnreadOnly((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
            >
              <Filter className="h-4 w-4" />
              {unreadOnly ? "Unread" : "All"}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/70" />
              <input
                className="h-9 w-64 max-w-[60vw] rounded-2xl bg-white/5 ring-1 ring-white/10 pl-9 pr-3 text-xs outline-none focus:ring-[#f97316]/40"
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 text-xs outline-none focus:ring-[#f97316]/40"
            >
              <option value="">All categories</option>
              <option value="leave">Leave</option>
              <option value="tasks">Tasks</option>
              <option value="payroll">Payroll</option>
              <option value="system">System</option>
            </select>
            <button
              type="button"
              onClick={markAllRead}
              disabled={bulkBusy}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" />
              {bulkBusy ? "…" : "Mark all read"}
            </button>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
            >
              Refresh
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-300/85">
          Mark important items as read once you’ve acknowledged them.
        </p>
        <div className="mt-6 grid gap-3">
          {loading ? (
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 text-sm text-slate-300/85">
              Loading…
            </div>
          ) : null}
          {items.map((n) => (
            <div
              key={n.id}
              className={[
                "rounded-3xl bg-white/5 ring-1 p-4",
                n.read ? "ring-white/10" : "ring-[#f97316]/25",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                {String(n.severity || "") === "warning" ? (
                  <TriangleAlert className="h-4 w-4 text-[#F59E0B]" />
                ) : (
                  <Bell className="h-4 w-4 text-[#f97316]" />
                )}
                {n.title ?? "Notification"}
              </div>
              <div className="mt-2 text-sm text-slate-300/85">{n.message ?? ""}</div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-200/80 ring-1 ring-white/10 bg-white/5">
                  <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
                  {n.category ?? "system"} • {new Date(n.createdAt).toLocaleString()}
                </div>
                {!n.read ? (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-white bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                  >
                    <Check className="h-4 w-4" />
                    Mark read
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 ? (
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 text-sm text-slate-300/85">
              No notifications yet. When Admin assigns tasks, approves leave, or generates a payslip, you’ll see it here.
            </div>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}

