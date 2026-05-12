"use client";

import { cn } from "@/lib/utils";
import { marketingSurface } from "@/components/marketing/marketing-styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import * as React from "react";
import { Building2, Mail, Users, Pencil, Save, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";

type ApiEmployee = {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  skills?: string[];
  experienceYears?: number;
  joinedAt?: string;
};

export default function AdminEmployeesPage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<ApiEmployee[]>([]);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<ApiEmployee | null>(null);

  const [fName, setFName] = React.useState("");
  const [fDept, setFDept] = React.useState("");
  const [fDesig, setFDesig] = React.useState("");
  const [fStatus, setFStatus] = React.useState("");
  const [fEmail, setFEmail] = React.useState("");
  const [fPhone, setFPhone] = React.useState("");
  const [fLocation, setFLocation] = React.useState("");
  const [fLinkedin, setFLinkedin] = React.useState("");
  const [fJoinedAt, setFJoinedAt] = React.useState("");
  const [fExp, setFExp] = React.useState<string>("");
  const [fSkills, setFSkills] = React.useState("");

  const loadEmployees = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch<{ employees: ApiEmployee[] }>("/admin/employees", { token: auth.token })
      .then((res) => {
        if (cancelled) return;
        setRows(res.employees ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load employees");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    return loadEmployees();
  }, [loadEmployees]);

  const openEdit = React.useCallback((emp: ApiEmployee) => {
    setSelected(emp);
    setEditError(null);
    setFName(emp.name ?? "");
    setFDept(emp.department ?? "");
    setFDesig(emp.designation ?? "");
    setFStatus(emp.status ?? "");
    setFEmail(emp.email ?? "");
    setFPhone(emp.phone ?? "");
    setFLocation(emp.location ?? "");
    setFLinkedin(emp.linkedin ?? "");
    setFJoinedAt(emp.joinedAt ?? "");
    setFExp(emp.experienceYears != null ? String(emp.experienceYears) : "");
    setFSkills((emp.skills ?? []).join(", "));
    setEditOpen(true);
  }, []);

  const saveEdit = React.useCallback(() => {
    if (!auth.token || !selected) return;
    setEditSaving(true);
    setEditError(null);
    const exp = fExp.trim() === "" ? undefined : Number(fExp);
    const skills = fSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    apiFetch<{ ok: boolean; employee: ApiEmployee }>(`/admin/employees/${selected.id}`, {
      method: "PUT",
      token: auth.token,
      body: JSON.stringify({
        name: fName || undefined,
        department: fDept || undefined,
        designation: fDesig || undefined,
        status: fStatus || undefined,
        email: fEmail || undefined,
        phone: fPhone || undefined,
        location: fLocation || undefined,
        linkedin: fLinkedin || undefined,
        joinedAt: fJoinedAt || undefined,
        experienceYears: Number.isFinite(exp) ? exp : undefined,
        skills: skills.length ? skills : undefined,
      }),
    })
      .then((r) => {
        const updated = r.employee;
        setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setSelected(updated);
        setEditOpen(false);
      })
      .catch((e) => setEditError(e instanceof Error ? e.message : "Failed to save"))
      .finally(() => setEditSaving(false));
  }, [
    auth.token,
    selected,
    fName,
    fDept,
    fDesig,
    fStatus,
    fEmail,
    fPhone,
    fLocation,
    fLinkedin,
    fJoinedAt,
    fExp,
    fSkills,
  ]);

  const departmentsCount = new Set(rows.map((e) => e.department)).size;

  return (
    <DashboardShell role="admin" title="Employees">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className={cn("lg:col-span-4", marketingSurface, "p-6")}>
          <div className="text-base font-semibold">Directory Summary</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600 dark:text-slate-400">Total Employees</div>
                <Users className="h-4 w-4 text-[#f97316]" />
              </div>
              <div className="mt-1 text-sm font-semibold">
                {loading ? "…" : rows.length}
              </div>
            </div>
            <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600 dark:text-slate-400">Departments</div>
                <Building2 className="h-4 w-4 text-[#f97316]" />
              </div>
              <div className="mt-1 text-sm font-semibold">
                {loading ? "…" : departmentsCount}
              </div>
            </div>
            {error ? (
              <div className="rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className={cn("lg:col-span-8", marketingSurface, "overflow-hidden p-0")}>
          <div className="px-6 py-5 border-b border-white/10">
            <div className="text-base font-semibold">Employee List</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">
              Loaded from API Gateway (JWT-protected).
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-muted/50 dark:bg-white/5">
                <tr className="text-left text-slate-800 dark:text-slate-200/85">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-t border-white/10">
                    <td className="px-6 py-4 font-semibold">{e.name}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{e.id}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{e.department}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">{e.designation}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200/85">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#f97316]" />
                        {e.email ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openEdit(e)}
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
                      >
                        <Pencil className="h-4 w-4 text-[#f97316]" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={6}>
                      Loading employees…
                    </td>
                  </tr>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-600 dark:text-slate-400" colSpan={6}>
                      No employees returned by API (demo).
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => {
          if (editSaving) return;
          setEditOpen(false);
        }}
        title={selected ? `Edit Employee • ${selected.name}` : "Edit Employee"}
      >
        {editError ? (
          <div className="mb-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
            {editError}
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Full name"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Status (e.g., Active)"
            value={fStatus}
            onChange={(e) => setFStatus(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Department"
            value={fDept}
            onChange={(e) => setFDept(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Designation"
            value={fDesig}
            onChange={(e) => setFDesig(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Email"
            value={fEmail}
            onChange={(e) => setFEmail(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Phone"
            value={fPhone}
            onChange={(e) => setFPhone(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Location"
            value={fLocation}
            onChange={(e) => setFLocation(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="LinkedIn URL"
            value={fLinkedin}
            onChange={(e) => setFLinkedin(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            type="date"
            placeholder="Joined at"
            value={fJoinedAt}
            onChange={(e) => setFJoinedAt(e.target.value)}
          />
          <input
            className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#f97316]/40"
            type="number"
            placeholder="Experience (years)"
            value={fExp}
            onChange={(e) => setFExp(e.target.value)}
          />
          <textarea
            className="sm:col-span-2 min-h-24 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 py-3 text-sm outline-none focus:ring-[#f97316]/40"
            placeholder="Skills (comma-separated)"
            value={fSkills}
            onChange={(e) => setFSkills(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (editSaving) return;
              setEditOpen(false);
            }}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={editSaving || !selected}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {editSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </Modal>
    </DashboardShell>
  );
}

