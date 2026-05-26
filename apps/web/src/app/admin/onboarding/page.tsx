"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/features/auth/useAuth";
import { adminPortalFetch, onboardingFileUrl } from "@/lib/admin-portal-api";
import {
  ONBOARDING_FILE_KEYS,
  ONBOARDING_FILE_LABELS,
  ONBOARDING_OPTIONAL_FILE_KEYS,
  ONBOARDING_POLICIES,
} from "@/lib/onboarding-fields";
import { Download, Eye, FileText, RefreshCw, Search, UserPlus } from "lucide-react";

type SubmissionListItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  personal: Record<string, unknown>;
  status: string;
  created_at: string;
};

type SubmissionDetail = SubmissionListItem & {
  files: Record<string, { filename: string; mime: string; data?: string }>;
};

const STATUS_OPTIONS = ["submitted", "reviewing", "approved", "rejected"] as const;

const ALL_FILE_KEYS = [...ONBOARDING_FILE_KEYS, ...ONBOARDING_OPTIONAL_FILE_KEYS];

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

function statusClass(status: string) {
  if (status === "approved") return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";
  if (status === "rejected") return "bg-red-500/15 text-red-800 dark:text-red-200";
  if (status === "reviewing") return "bg-amber-500/15 text-amber-900 dark:text-amber-200";
  return "bg-muted/50 text-slate-700 dark:text-slate-300";
}

export default function AdminOnboardingPage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<SubmissionListItem[]>([]);
  const [q, setQ] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<SubmissionDetail | null>(null);
  const [status, setStatus] = React.useState<string>("submitted");
  const [saving, setSaving] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    adminPortalFetch<{ ok: boolean; submissions: SubmissionListItem[] }>(
      "/onboarding/submissions",
      { token: auth.token }
    )
      .then((r) => setRows(r.submissions ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load submissions"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.id, r.name, r.email, r.phone, r.status, String(r.personal?.aadhar_number ?? "")]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  const openSubmission = React.useCallback(
    (row: SubmissionListItem) => {
      if (!auth.token) return;
      setOpen(true);
      setDetailLoading(true);
      setModalError(null);
      setSelected(null);
      adminPortalFetch<{ ok: boolean; submission: SubmissionDetail }>(
        `/onboarding/submissions/${row.id}`,
        { token: auth.token }
      )
        .then((r) => {
          setSelected(r.submission);
          setStatus(r.submission.status || "submitted");
        })
        .catch((e) => setModalError(e instanceof Error ? e.message : "Failed to load details"))
        .finally(() => setDetailLoading(false));
    },
    [auth.token]
  );

  const saveStatus = React.useCallback(() => {
    if (!auth.token || !selected) return;
    setSaving(true);
    setModalError(null);
    adminPortalFetch<{ ok: boolean; submission: SubmissionDetail }>(
      `/onboarding/submissions/${selected.id}`,
      {
        method: "PATCH",
        token: auth.token,
        body: JSON.stringify({ status }),
      }
    )
      .then((r) => {
        setSelected(r.submission);
        setRows((prev) => prev.map((x) => (x.id === r.submission.id ? { ...x, status: r.submission.status } : x)));
      })
      .catch((e) => setModalError(e instanceof Error ? e.message : "Failed to update status"))
      .finally(() => setSaving(false));
  }, [auth.token, selected, status]);

  const pendingCount = rows.filter((r) => r.status === "submitted").length;

  return (
    <DashboardShell role="admin" title="Onboarding">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className={cn("lg:col-span-4", marketingSurface, "p-6")}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="h-4 w-4 text-[#f97316]" />
            New hire documents
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
            Submissions from the public login <strong>Onboarding</strong> tab — ID proofs, offer letter,
            policies, education files, and personal details.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-600 dark:text-red-200/90">
              {error}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-xs text-slate-600 dark:text-slate-400">Total submissions</div>
              <div className="mt-1 text-base font-semibold">{loading ? "…" : rows.length}</div>
            </div>
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-xs text-slate-600 dark:text-slate-400">Awaiting review</div>
              <div className="mt-1 text-base font-semibold">{loading ? "…" : pendingCount}</div>
            </div>
          </div>
        </div>

        <div className={cn("lg:col-span-8", marketingSurface, "overflow-hidden p-0")}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5 dark:border-white/10">
            <div>
              <div className="text-base font-semibold">Onboarding inbox</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">
                View photos & documents, update status.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="h-10 w-64 max-w-[70vw] rounded-2xl bg-muted/50 pl-9 pr-3 text-sm ring-1 ring-border outline-none focus:ring-[#f97316]/40 dark:bg-white/5 dark:ring-white/10"
                  placeholder="Search name, email…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs font-semibold ring-1 ring-border transition hover:bg-muted/80 dark:bg-white/5 dark:ring-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-muted/50 dark:bg-white/5">
                <tr className="text-left text-slate-800 dark:text-slate-200/85">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top dark:border-white/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{r.name}</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.email}</div>
                    </td>
                    <td className="px-6 py-4">{r.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
                          statusClass(r.status)
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openSubmission(r)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs font-semibold ring-1 ring-border transition hover:bg-muted/80 dark:bg-white/5 dark:ring-white/10"
                      >
                        <Eye className="h-4 w-4 text-[#f97316]" />
                        View documents
                      </button>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan={5}>
                      No onboarding submissions yet.
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
        title={selected ? `Onboarding • ${selected.name}` : "Onboarding"}
      >
        {modalError ? (
          <div className="mb-4 rounded-2xl bg-red-500/10 p-4 text-xs text-red-600 ring-1 ring-red-500/20 dark:text-red-200/90">
            {modalError}
          </div>
        ) : null}

        {detailLoading ? (
          <p className="text-sm text-slate-500">Loading documents…</p>
        ) : null}

        {selected && !detailLoading ? (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Email" value={selected.email} />
              <Info label="Phone" value={selected.phone} />
              <Info label="Gender" value={String(selected.personal?.gender ?? "—")} />
              <Info label="Age" value={String(selected.personal?.age ?? "—")} />
              <Info label="Father" value={String(selected.personal?.father_name ?? "—")} />
              <Info label="Mother" value={String(selected.personal?.mother_name ?? "—")} />
              <Info label="Parents phone" value={String(selected.personal?.parents_phone ?? "—")} />
              <Info label="Aadhaar" value={String(selected.personal?.aadhar_number ?? "—")} />
              <Info
                label="Experience"
                value={
                  selected.personal?.is_experienced
                    ? "Yes — experienced candidate"
                    : "No — fresher"
                }
              />
            </div>

            {selected.personal?.is_experienced && selected.personal?.previous_company_details ? (
              <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
                <div className="text-xs text-slate-500">Previous company</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{String(selected.personal.previous_company_details)}</p>
              </div>
            ) : null}

            <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Policy acknowledgements</div>
              <ul className="mt-2 space-y-1 text-sm">
                {ONBOARDING_POLICIES.map((p) => {
                  const ack = (selected.personal?.policies_ack ?? {}) as Record<string, boolean>;
                  return (
                    <li key={p.id} className={ack[p.id] ? "text-emerald-700 dark:text-emerald-300" : "text-red-600"}>
                      {ack[p.id] ? "✓" : "✗"} {p.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-[#f97316]" />
                Uploaded documents
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {ALL_FILE_KEYS.map((key) => {
                  const meta = selected.files?.[key];
                  if (!meta) return null;
                  const label = ONBOARDING_FILE_LABELS[key]?.label ?? key;
                  const viewUrl = onboardingFileUrl(selected.id, key);
                  const downloadUrl = onboardingFileUrl(selected.id, key, true);
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-border bg-white/50 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="text-sm font-medium">{label}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{meta.filename}</div>
                      {isImageMime(meta.mime) ? (
                        <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={viewUrl}
                            alt={label}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">{meta.mime} — open or download</p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold ring-1 ring-border dark:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Open
                        </a>
                        <a
                          href={downloadUrl}
                          download
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold ring-1 ring-border dark:bg-white/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm font-semibold">HR status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl bg-muted/50 px-4 text-sm ring-1 ring-border outline-none focus:ring-[#f97316]/40 dark:bg-white/5 dark:ring-white/10"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={saveStatus}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#fb923c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save status"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
