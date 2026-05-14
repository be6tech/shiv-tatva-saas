"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Wallet, Shield, Sparkles, Download, RefreshCw } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

type ApiEmployee = {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  email?: string;
};

type PayslipRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  month: string; // YYYY-MM
  currency: "INR";
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  pf: number;
  esi: number;
  tds: number;
  otherDeductions: number;
  earnings: number;
  deductions: number;
  netPay: number;
  status: "Generated";
  updatedAt: string;
};

export default function AdminPayrollPage() {
  const auth = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<PayslipRow[]>([]);
  const [employees, setEmployees] = React.useState<ApiEmployee[]>([]);

  const [employeeId, setEmployeeId] = React.useState("");
  const [month, setMonth] = React.useState(() => new Date().toISOString().slice(0, 7));
  const [basic, setBasic] = React.useState(65000);
  const [hra, setHra] = React.useState(18000);
  const [allowances, setAllowances] = React.useState(6000);
  const [bonus, setBonus] = React.useState(0);
  const [pf, setPf] = React.useState(1800);
  const [esi, setEsi] = React.useState(0);
  const [tds, setTds] = React.useState(2500);
  const [otherDeductions, setOtherDeductions] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [generating, setGenerating] = React.useState(false);

  const load = React.useCallback(() => {
    if (!auth.hydrated || !auth.token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch<{ payslips: PayslipRow[] }>("/admin/payslips", { token: auth.token }),
      apiFetch<{ employees: ApiEmployee[] }>("/admin/employees", { token: auth.token }),
    ])
      .then(([p, e]) => {
        setRows(p.payslips ?? []);
        setEmployees(e.employees ?? []);
        if ((e.employees ?? []).length && !employeeId) setEmployeeId(e.employees[0]!.id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load payroll"))
      .finally(() => setLoading(false));
  }, [auth.hydrated, auth.token, employeeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const generate = React.useCallback(() => {
    if (!auth.token) return;
    setGenerating(true);
    setError(null);
    apiFetch<{ ok: boolean; payslip: PayslipRow }>("/admin/payslips/generate", {
      method: "POST",
      token: auth.token,
      body: JSON.stringify({
        employeeId,
        month,
        basic,
        hra,
        allowances,
        bonus,
        pf,
        esi,
        tds,
        otherDeductions,
        notes,
      }),
    })
      .then(() => {
        setNotes("");
        load();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to generate payslip"))
      .finally(() => setGenerating(false));
  }, [auth.token, employeeId, month, basic, hra, allowances, bonus, pf, esi, tds, otherDeductions, notes, load]);

  const totals = React.useMemo(() => {
    const earnings = basic + hra + allowances + bonus;
    const deductions = pf + esi + tds + otherDeductions;
    const net = Math.max(0, earnings - deductions);
    return { earnings, deductions, net };
  }, [basic, hra, allowances, bonus, pf, esi, tds, otherDeductions]);

  const exportCsv = React.useCallback(() => {
    const header = [
      "Payslip ID",
      "Employee ID",
      "Employee Name",
      "Department",
      "Designation",
      "Month",
      "Basic",
      "HRA",
      "Allowances",
      "Bonus",
      "PF",
      "ESI",
      "TDS",
      "Other Deductions",
      "Earnings",
      "Deductions",
      "Net Pay",
      "Status",
      "Updated At",
    ];
    const lines = rows.map((r) => {
      const row = [
        r.id,
        r.employeeId,
        r.employeeName,
        r.department,
        r.designation,
        r.month,
        r.basic,
        r.hra,
        r.allowances,
        r.bonus,
        r.pf,
        r.esi,
        r.tds,
        r.otherDeductions,
        r.earnings,
        r.deductions,
        r.netPay,
        r.status,
        r.updatedAt,
      ];
      return row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payslips.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

  return (
    <DashboardShell role="admin" title="Payroll">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 glass rounded-3xl p-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-700 dark:text-slate-200/80 ring-1 ring-border bg-muted/50 dark:bg-white/5 dark:ring-white/10">
            <Sparkles className="h-3.5 w-3.5 text-[#F57C00]" />
            Payroll Management
          </div>
          <div className="mt-4 text-xl font-semibold">Payroll Summary</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
            Generate payslips, run summaries, and export compliance reports. Stored locally for this demo.
          </p>
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 text-xs text-red-200/90">
              {error}
            </div>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Processed (demo)</div>
                <Wallet className="h-5 w-5 text-[#F57C00]" />
              </div>
              <div className="mt-2 text-2xl font-semibold">₹ {rows.reduce((a, r) => a + (r.netPay ?? 0), 0).toLocaleString("en-IN")}</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Total net pay (all payslips)</div>
            </div>
            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Compliance</div>
                <Shield className="h-5 w-5 text-[#F57C00]" />
              </div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300/90">
                PF • ESI • TDS exports (UI-ready)
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">Payslip Register</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-foreground bg-muted ring-1 ring-border dark:text-white dark:bg-white/5 dark:ring-white/10 hover:bg-muted dark:hover:bg-white/10 transition"
                >
                  <Download className="h-4 w-4 text-[#F57C00]" />
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
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead className="bg-muted/50 dark:bg-white/5">
                  <tr className="text-left text-slate-800 dark:text-slate-200/85">
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Month</th>
                    <th className="px-5 py-4">Net Pay</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-white/10">
                      <td className="px-5 py-4">
                        <div className="font-semibold">{r.employeeName}</div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.employeeId}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200/85">{r.month}</td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200/85">
                        ₹ {Number(r.netPay ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200/85">{new Date(r.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {loading ? (
                    <tr>
                      <td className="px-5 py-8 text-slate-600 dark:text-slate-400" colSpan={5}>
                        Loading…
                      </td>
                    </tr>
                  ) : null}
                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-slate-600 dark:text-slate-400" colSpan={5}>
                        No payslips generated yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 glass rounded-3xl p-6">
          <div className="text-base font-semibold">Payslip Generation</div>
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300/90">
            Generate a payslip for an employee for a month (updates existing if already generated).
          </div>
          <div className="mt-6 grid gap-3">
            <select
              className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
              {!employees.length ? <option value="">No employees loaded</option> : null}
            </select>
            <input
              className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={basic}
                onChange={(e) => setBasic(Number(e.target.value))}
                placeholder="Basic"
              />
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={hra}
                onChange={(e) => setHra(Number(e.target.value))}
                placeholder="HRA"
              />
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(Number(e.target.value))}
                placeholder="Allowances"
              />
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                placeholder="Bonus"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={pf}
                onChange={(e) => setPf(Number(e.target.value))}
                placeholder="PF"
              />
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={tds}
                onChange={(e) => setTds(Number(e.target.value))}
                placeholder="TDS"
              />
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={esi}
                onChange={(e) => setEsi(Number(e.target.value))}
                placeholder="ESI"
              />
              <input
                className="h-11 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 text-sm outline-none focus:ring-[#F57C00]/40"
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                placeholder="Other deductions"
              />
            </div>

            <textarea
              className="min-h-24 rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 px-4 py-3 text-sm outline-none focus:ring-[#F57C00]/40"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="rounded-3xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-5">
              <div className="text-xs text-slate-600 dark:text-slate-400">Preview totals</div>
              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Earnings</div>
                  <div className="mt-1 font-semibold">₹ {totals.earnings.toLocaleString("en-IN")}</div>
                </div>
                <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Deductions</div>
                  <div className="mt-1 font-semibold">₹ {totals.deductions.toLocaleString("en-IN")}</div>
                </div>
                <div className="rounded-2xl bg-muted/50 ring-1 ring-border dark:bg-white/5 dark:ring-white/10 p-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Net pay</div>
                  <div className="mt-1 font-semibold">₹ {totals.net.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={generating || !month || !employeeId || basic <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#F57C00] to-[#ff9a3d] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Wallet className="h-4 w-4" />
              {generating ? "Generating…" : "Generate Payslip"}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

