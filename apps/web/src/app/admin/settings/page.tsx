"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Lock, Shield, KeyRound, Save, RefreshCw, Building2 } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type OrgSettings = {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  locationText: string;
  workHoursPerDay: number;
  lateThresholdMinutes: number;
  anomalySpikeRatio: number;
};

export default function AdminSettingsPage() {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<OrgSettings | null>(null);

  const [companyName, setCompanyName] = React.useState("");
  const [supportEmail, setSupportEmail] = React.useState("");
  const [supportPhone, setSupportPhone] = React.useState("");
  const [locationText, setLocationText] = React.useState("");
  const [workHoursPerDay, setWorkHoursPerDay] = React.useState(8);
  const [lateThresholdMinutes, setLateThresholdMinutes] = React.useState(10);
  const [anomalySpikeRatio, setAnomalySpikeRatio] = React.useState(0.4);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    setOk(null);
    apiFetch<{ settings: OrgSettings }>("/admin/settings", { token: auth.token })
      .then((r) => {
        setSettings(r.settings);
        setCompanyName(r.settings.companyName ?? "");
        setSupportEmail(r.settings.supportEmail ?? "");
        setSupportPhone(r.settings.supportPhone ?? "");
        setLocationText(r.settings.locationText ?? "");
        setWorkHoursPerDay(Number(r.settings.workHoursPerDay ?? 8));
        setLateThresholdMinutes(Number(r.settings.lateThresholdMinutes ?? 10));
        setAnomalySpikeRatio(Number(r.settings.anomalySpikeRatio ?? 0.4));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load settings"))
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
    apiFetch<{ ok: boolean; settings: OrgSettings }>("/admin/settings", {
      method: "PUT",
      token: auth.token,
      body: JSON.stringify({
        companyName,
        supportEmail,
        supportPhone,
        locationText,
        workHoursPerDay,
        lateThresholdMinutes,
        anomalySpikeRatio,
      }),
    })
      .then((r) => {
        setSettings(r.settings);
        setOk("Saved.");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to save settings"))
      .finally(() => setSaving(false));
  }, [
    auth.token,
    companyName,
    supportEmail,
    supportPhone,
    locationText,
    workHoursPerDay,
    lateThresholdMinutes,
    anomalySpikeRatio,
  ]);

  return (
    <DashboardShell role="admin" title="Settings">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6 glass rounded-3xl p-6">
          <div className="text-base font-semibold">Security</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
            Configure JWT/OAuth, RBAC, HTTPS, and MFA policies. (UI placeholder)
          </p>
          <div className="mt-6 grid gap-3">
            {[
              { label: "JWT Authentication", icon: KeyRound, value: "Enabled" },
              { label: "OAuth 2.0 / SSO", icon: Shield, value: "Ready" },
              { label: "MFA Authentication", icon: Lock, value: "Optional" },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <s.icon className="h-4 w-4 text-[#F57C00]" />
                    {s.label}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-200/80">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 glass rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">System</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
                Persisted org settings. These power public contact channels and anomaly thresholds.
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
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
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-[#F57C00]" />
                Organization
              </div>
              <div className="mt-4 grid gap-3">
                <input
                  className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <input
                  className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                  placeholder="Support email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
                <input
                  className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                  placeholder="Support phone"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                />
                <input
                  className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                  placeholder="Location text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-sm font-semibold">Policies</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Work hours/day</div>
                  <input
                    className="mt-2 h-10 w-full rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-3 text-sm outline-none focus:ring-[#F57C00]/40"
                    type="number"
                    value={workHoursPerDay}
                    onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
                  />
                </div>
                <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Late threshold (min)</div>
                  <input
                    className="mt-2 h-10 w-full rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-3 text-sm outline-none focus:ring-[#F57C00]/40"
                    type="number"
                    value={lateThresholdMinutes}
                    onChange={(e) => setLateThresholdMinutes(Number(e.target.value))}
                  />
                </div>
                <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Anomaly spike ratio</div>
                  <input
                    className="mt-2 h-10 w-full rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-3 text-sm outline-none focus:ring-[#F57C00]/40"
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.9"
                    value={anomalySpikeRatio}
                    onChange={(e) => setAnomalySpikeRatio(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Current settings loaded: {settings ? "Yes" : "No"}
              </div>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#F57C00] to-[#ff9a3d] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

