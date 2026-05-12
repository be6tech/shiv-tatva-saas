"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import * as React from "react";
import { Download, Inbox, RefreshCw, Search, Eye, Save } from "lucide-react";
import { Modal } from "@/components/ui/modal";

type LeadRow = {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  source?: string;
  status: "New" | string;
  createdAt: string;
  updatedAt?: string;
  internalNotes?: string;
};

export default function AdminLeadsPage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<LeadRow[]>([]);
  const [q, setQ] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<LeadRow | null>(null);
  const [status, setStatus] = React.useState<"New" | "In Progress" | "Won" | "Lost">("New");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    apiFetch<{ leads: LeadRow[] }>("/admin/leads", { token: auth.token })
      .then((r) => setRows(r.leads ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load leads"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.id, r.name, r.email, r.company ?? "", r.phone ?? "", r.message ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  const exportCsv = React.useCallback(() => {
    const header = ["Lead ID", "Name", "Email", "Company", "Phone", "Source", "Status", "Created At", "Message"];
    const lines = filtered.map((r) => {
      const row = [
        r.id,
        r.name,
        r.email,
        r.company ?? "",
        r.phone ?? "",
        r.source ?? "contact",
        r.status ?? "New",
        r.createdAt,
        r.message ?? "",
      ];
      return row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const newCount = rows.filter((r) => (r.status ?? "New") === "New").length;

  const openLead = React.useCallback((r: LeadRow) => {
    setSelected(r);
    setStatus((r.status as any) || "New");
    setNotes(r.internalNotes ?? "");
    setModalError(null);
    setOpen(true);
  }, []);

  const saveLead = React.useCallback(() => {
    if (!auth.token || !selected) return;
    setSaving(true);
    setModalError(null);
    apiFetch<{ ok: boolean; lead: LeadRow }>(`/admin/leads/${selected.id}`, {
      method: "PUT",
      token: auth.token,
      body: JSON.stringify({ status, internalNotes: notes }),
    })
      .then((r) => {
        const updated = r.lead;
        setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setSelected(updated);
        setOpen(false);
      })
      .catch((e) => setModalError(e instanceof Error ? e.message : "Failed to save lead"))
      .finally(() => setSaving(false));
  }, [auth.token, selected, status, notes]);

  return (
    <DashboardShell role="admin" title="Leads">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className={cn("lg:col-span-4", marketingSurface, "p-6")}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Inbox className="h-4 w-4 text-[#f97316]" />
            Lead capture
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
            Enquiries submitted from the public Contact page are stored here and also pushed into Admin notifications.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-xs text-slate-600 dark:text-slate-400">Total leads</div>
              <div className="mt-1 text-base font-semibold">{loading ? "…" : rows.length}</div>
            </div>
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-xs text-slate-600 dark:text-slate-400">New</div>
              <div className="mt-1 text-base font-semibold">{loading ? "…" : newCount}</div>
            </div>
          </div>
        </div>

        <div className={cn("lg:col-span-8", marketingSurface, "overflow-hidden p-0")}>
          <div className="px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold">Leads Inbox</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">Search, export, and follow up quickly.</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                <input
                  className="h-10 w-64 max-w-[70vw] rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 pl-9 pr-3 text-sm outline-none focus:ring-[#f97316]/40"
                  placeholder="Search leads…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
              >
                <Download className="h-4 w-4 text-[#f97316]" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-muted/50 dark:bg-white/5">
                <tr className="text-left text-slate-800 dark:text-slate-200/85">
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-white/10 align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{r.name}</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.email}</div>
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">“{r.message}”</div>
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{r.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.company ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{r.phone ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
                        {r.status ?? "New"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openLead(r)}
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
                      >
                        <Eye className="h-4 w-4 text-[#f97316]" />
                        View
                      </button>
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
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={6}>
                      No leads yet. Submit the Contact form to create one.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => {
          if (saving) return;
          setOpen(false);
        }}
        title={selected ? `Lead • ${selected.name}` : "Lead"}
      >
        {modalError ? (
          <div className="mb-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
            {modalError}
          </div>
        ) : null}
        {selected ? (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="text-xs text-slate-600 dark:text-slate-400">Email</div>
                <div className="mt-1 text-sm font-semibold">{selected.email}</div>
              </div>
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="text-xs text-slate-600 dark:text-slate-400">Phone</div>
                <div className="mt-1 text-sm font-semibold">{selected.phone ?? "—"}</div>
              </div>
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="text-xs text-slate-600 dark:text-slate-400">Company</div>
                <div className="mt-1 text-sm font-semibold">{selected.company ?? "—"}</div>
              </div>
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="text-xs text-slate-600 dark:text-slate-400">Source</div>
                <div className="mt-1 text-sm font-semibold">{selected.source ?? "contact"}</div>
              </div>
            </div>

            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-xs text-slate-600 dark:text-slate-400">Message</div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200/85">{selected.message}</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm font-semibold">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-2 h-11 w-full rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
                >
                  {["New", "In Progress", "Won", "Lost"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-sm font-semibold">Internal notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-28 w-full rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 py-3 text-sm outline-none focus:ring-[#f97316]/40"
                  placeholder="Add follow-up notes, next steps, meeting links, etc."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={saveLead}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardShell>
  );
}

