"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BarChart3, TrendingUp, Users, Timer, Download } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AdminAnalyticsPage() {
  const auth = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [insights, setInsights] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [live, setLive] = React.useState<{ late: number; overtime: number; online: number }>({
    late: 0,
    overtime: 0,
    online: 0,
  });
  const [snapshot, setSnapshot] = React.useState<{
    working: number;
    lunch: number;
    break: number;
    offline: number;
    checkedOut: number;
  }>({ working: 0, lunch: 0, break: 0, offline: 0, checkedOut: 0 });
  const [series, setSeries] = React.useState<
    {
      dateKey: string;
      online: number;
      late: number;
      overtime: number;
      checkedIn?: number;
      checkedOut?: number;
      total: number;
    }[]
  >([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    apiFetch<{ insights?: string[]; ok?: boolean; error?: string }>("/ai/insights", {
      method: "POST",
      token: auth.token,
      body: JSON.stringify({ department: "Engineering", sample_size: 50 }),
    })
      .then((r) => setInsights(r.insights ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load insights"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    apiFetch<{ late: number; overtime: number; online: number }>("/admin/attendance/metrics", {
      token: auth.token,
    })
      .then((r) => setLive({ late: r.late ?? 0, overtime: r.overtime ?? 0, online: r.online ?? 0 }))
      .catch(() => setLive({ late: 0, overtime: 0, online: 0 }));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    apiFetch<{
      days: {
        dateKey: string;
        online: number;
        late: number;
        overtime: number;
        checkedIn?: number;
        checkedOut?: number;
        total: number;
      }[];
    }>(
      "/admin/attendance/timeseries",
      { token: auth.token }
    )
      .then((r) => setSeries(r.days ?? []))
      .catch(() => setSeries([]));
  }, [auth.hydrated, auth.token]);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    apiFetch<{ rows: any[] }>("/admin/live-status", { token: auth.token })
      .then((r) => {
        const rows = r.rows ?? [];
        const count = (s: string) => rows.filter((x) => x.status === s).length;
        setSnapshot({
          working: count("Working"),
          lunch: count("On Lunch"),
          break: count("On Break"),
          offline: count("Offline"),
          checkedOut: count("Checked Out"),
        });
      })
      .catch(() =>
        setSnapshot({ working: 0, lunch: 0, break: 0, offline: 0, checkedOut: 0 })
      );
  }, [auth.hydrated, auth.token]);

  const exportAnalyticsCsv = React.useCallback(() => {
    const header = ["Date", "Total", "Checked In", "Checked Out", "Late", "Overtime"];
    const lines = series.map((d) => {
      const row = [
        d.dateKey,
        d.total,
        d.checkedIn ?? "",
        d.checkedOut ?? "",
        d.late,
        d.overtime,
      ];
      return row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-attendance-7d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [series]);

  return (
    <DashboardShell role="admin" title="Analytics">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 glass rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Attendance Analytics</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
                Daily attendance, late arrivals, break analysis, productivity reports,
                and overtime reporting.
              </p>
            </div>
            <button
              type="button"
              onClick={exportAnalyticsCsv}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
            >
              <Download className="h-4 w-4 text-[#F57C00]" />
              Export CSV
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Daily Attendance", icon: BarChart3 },
              { label: `Late Arrivals (${live.late})`, icon: TrendingUp },
              { label: `Online Now (${live.online})`, icon: Users },
              { label: `Overtime (${live.overtime})`, icon: Timer },
            ].map((c) => (
              <div key={c.label} className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <c.icon className="h-4 w-4 text-[#F57C00]" />
                  {c.label}
                </div>
                <div className="mt-4 h-28 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 overflow-hidden">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={112}>
                      <LineChart data={series}>
                        <CartesianGrid stroke="rgba(255,255,255,.06)" />
                        <XAxis dataKey="dateKey" hide />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(2,6,23,.85)",
                            border: "1px solid rgba(255,255,255,.12)",
                            borderRadius: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="checkedIn"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-muted/50 dark:bg-white/5" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-6">
            <div className="text-sm font-semibold">Trend snapshot (live)</div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Working", value: snapshot.working },
                { label: "Lunch", value: snapshot.lunch },
                { label: "Break", value: snapshot.break },
                { label: "Offline", value: snapshot.offline },
                { label: "Checked Out", value: snapshot.checkedOut },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">{s.label}</div>
                  <div className="mt-1 text-base font-semibold">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="text-sm font-semibold">Status distribution</div>
                <div className="mt-4 h-52">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={208}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Working", value: snapshot.working },
                            { name: "Lunch", value: snapshot.lunch },
                            { name: "Break", value: snapshot.break },
                            { name: "Offline", value: snapshot.offline },
                            { name: "Checked Out", value: snapshot.checkedOut },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {["#10B981", "#F59E0B", "#F57C00", "#94A3B8", "#0B1F3A"].map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(2,6,23,.85)",
                            border: "1px solid rgba(255,255,255,.12)",
                            borderRadius: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-muted/50 dark:bg-white/5" />
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
                <div className="text-sm font-semibold">Late vs Overtime (7 days)</div>
                <div className="mt-4 h-52">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={208}>
                      <BarChart data={series}>
                        <CartesianGrid stroke="rgba(255,255,255,.06)" />
                        <XAxis dataKey="dateKey" hide />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(2,6,23,.85)",
                            border: "1px solid rgba(255,255,255,.12)",
                            borderRadius: 12,
                          }}
                        />
                        <Legend />
                        <Bar dataKey="late" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="overtime" fill="#F57C00" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-muted/50 dark:bg-white/5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 glass rounded-3xl p-6">
          <div className="text-base font-semibold">AI Insights</div>
          <div className="mt-4 space-y-3">
            {error ? (
              <div className="rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-sm text-red-200/90">
                {error} (Start FastAPI AI service on port 8001)
              </div>
            ) : null}
            {loading ? (
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4 text-sm text-slate-600 dark:text-slate-300/90">
                Loading insights…
              </div>
            ) : null}
            {!loading && insights.length === 0 && !error ? (
              <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4 text-sm text-slate-600 dark:text-slate-300/90">
                No insights returned yet.
              </div>
            ) : null}
            {insights.map((text, idx) => (
              <div
                key={`insight-${idx}-${text.slice(0, 24)}`}
                className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4 text-sm text-slate-600 dark:text-slate-300/90"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

