"use client";

import { PageShell } from "@/components/marketing/page-shell";
import {
  marketingSurface,
  marketingInset,
  marketingBody,
  marketingStrong,
  marketingList,
} from "@/components/marketing/marketing-styles";
import { ProductUIPreview } from "@/components/marketing/product-ui-preview";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Check, Layers3, ShieldCheck, Sparkles, Zap } from "lucide-react";

const products = [
  {
    id: "hrms",
    title: "HRMS Platform",
    desc: "Employee lifecycle management with RBAC, documents, and workflows.",
    bullets: ["Employee directory + profile sync", "Leave approvals", "Role-based access (RBAC-ready)"],
  },
  {
    id: "crm",
    title: "CRM Platform",
    desc: "Sales pipeline visibility with automation & reporting.",
    bullets: ["Pipeline stages + analytics", "Lead capture + routing", "Team activity tracking"],
  },
  {
    id: "erp",
    title: "ERP System",
    desc: "Enterprise process modules aligned for scale.",
    bullets: ["Modular architecture", "Audit-friendly workflows", "Extensible integrations"],
  },
  {
    id: "payroll",
    title: "Payroll Management",
    desc: "Payslips, summaries, exports, and compliance-ready reports.",
    bullets: ["Payslip generation", "CSV export", "Net pay preview + breakdown"],
  },
  {
    id: "tracking",
    title: "Employee Tracking",
    desc: "Realtime status, activity signals, and productivity insights.",
    bullets: ["Live status board", "Shift mapping", "Late/overtime signals"],
  },
  {
    id: "ai-analytics",
    title: "AI Analytics Dashboard",
    desc: "AI-driven analytics, anomaly detection, and smart recommendations.",
    bullets: ["7-day trend charts", "Anomaly alerts", "AI insights integration-ready"],
  },
];

export default function ProductsPage() {
  return (
    <PageShell
      title="Products"
      subtitle="Premium enterprise-grade SaaS products designed for workforce management, automation, and analytics."
    >
      <div className={cn(marketingSurface, "mb-4 p-6")}>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Modular suite", icon: Layers3, desc: "Pick modules or deploy the full enterprise platform." },
            { title: "Automation-first", icon: Zap, desc: "Smart workflows, alerts, and productivity insights." },
            { title: "Security-ready", icon: ShieldCheck, desc: "JWT + RBAC patterns with MFA/SSO roadmap." },
          ].map((x) => (
            <div key={x.title} className={cn(marketingInset, "p-6")}>
              <div className="flex items-center gap-3">
                <div className={cn(marketingInset, "flex h-11 w-11 shrink-0 items-center justify-center border-0 p-0")}>
                  <x.icon className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" />
                </div>
                <div className={cn("text-base font-semibold", marketingStrong)}>{x.title}</div>
              </div>
              <div className={cn("mt-3 text-sm", marketingBody)}>{x.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((p) => (
          <section key={p.id} id={p.id} className={cn(marketingSurface, "p-6 lg:p-7")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
                  Product
                </div>
                <h2 className={cn("mt-3 text-xl font-semibold", marketingStrong)}>{p.title}</h2>
                <p className={cn("mt-2 text-sm", marketingBody)}>{p.desc}</p>
              </div>
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-b from-[#ea580c] to-[#fb923c] opacity-90 dark:from-[#f97316] dark:to-amber-400" />
            </div>

            <div className="mt-5 grid gap-2 text-sm">
              {p.bullets.map((b) => (
                <div key={b} className={cn("flex items-start gap-2", marketingList)}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <ProductUIPreview productId={p.id} title={p.title} />

            <div className="mt-6">
              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
