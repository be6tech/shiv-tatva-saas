"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { User, ShieldCheck, Save, Sparkles } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type EmployeeProfile = {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  joinedAt?: string;
  skills?: string[];
  experienceYears?: number;
};

export default function EmployeeProfilePage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<EmployeeProfile | null>(null);

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [skills, setSkills] = React.useState("");

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    setOk(null);
    apiFetch<{ employee: EmployeeProfile }>("/employee/profile", { token: auth.token })
      .then((r) => {
        setProfile(r.employee);
        setEmail(r.employee.email ?? "");
        setPhone(r.employee.phone ?? "");
        setLocation(r.employee.location ?? "");
        setLinkedin(r.employee.linkedin ?? "");
        setSkills((r.employee.skills ?? []).join(", "));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = React.useCallback(() => {
    if (!auth.token) return;
    setSaving(true);
    setError(null);
    setOk(null);
    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    apiFetch<{ ok: boolean; employee: EmployeeProfile }>("/employee/profile", {
      method: "PUT",
      token: auth.token,
      body: JSON.stringify({
        email: email || undefined,
        phone: phone || undefined,
        location: location || undefined,
        linkedin: linkedin || undefined,
        skills: parsedSkills.length ? parsedSkills : undefined,
      }),
    })
      .then((r) => {
        setProfile(r.employee);
        setOk("Profile saved.");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to save profile"))
      .finally(() => setSaving(false));
  }, [auth.token, email, phone, location, linkedin, skills]);

  return (
    <DashboardShell role="employee" title="Profile">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 glass rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#F57C00]" />
            </div>
            <div>
              <div className="text-base font-semibold">
                {loading ? "Loading…" : (profile?.name ?? "Employee")}
              </div>
              <div className="text-xs text-slate-300/70">
                {profile?.id ?? "—"} • {profile?.department ?? "—"} • {profile?.designation ?? "—"}
              </div>
            </div>
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          {ok ? (
            <div className="mt-4 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 p-4 text-xs text-emerald-200/90">
              {ok}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            <input
              className="h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              className="h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
              placeholder="LinkedIn URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
            <textarea
              className="min-h-24 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm outline-none focus:ring-[#F57C00]/40"
              placeholder="Skills (comma-separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#F57C00] to-[#ff9a3d] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-7 glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-[#F57C00]" />
            Security
          </div>
          <p className="mt-2 text-sm text-slate-300/85">
            MFA setup, password reset, and session management (placeholder).
          </p>
          <div className="mt-6 h-48 rounded-3xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-xs text-slate-300/70">
            Security panel placeholder
          </div>
          <div className="mt-4 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-[#F57C00]" />
              Directory sync
            </div>
            <div className="mt-2 text-sm text-slate-300/85">
              Profile changes are reflected in the Admin Employees directory and saved in the backend JSON store.
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

