"use client";

import { PageShell } from "@/components/marketing/page-shell";
import {
  marketingSurface,
  marketingInset,
  marketingBody,
  marketingStrong,
  marketingList,
} from "@/components/marketing/marketing-styles";
import { SolutionWorkflowPreview } from "@/components/marketing/solution-workflow-preview";
import { cn } from "@/lib/utils";
import { Building2, GraduationCap, HeartPulse, Store, Factory, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const industries = [
  { id: "startups", title: "Startups", icon: Building2, desc: "Launch fast with scalable HRMS + automation workflows." },
  { id: "enterprises", title: "Enterprises", icon: Building2, desc: "Governance, compliance, RBAC, and advanced analytics." },
  { id: "education", title: "Educational Institutions", icon: GraduationCap, desc: "Staff management, attendance, and streamlined approvals." },
  { id: "healthcare", title: "Healthcare", icon: HeartPulse, desc: "Shift visibility, secure access, and operational reporting." },
  { id: "retail", title: "Retail", icon: Store, desc: "Multi-location attendance, roles, and productivity monitoring." },
  { id: "manufacturing", title: "Manufacturing", icon: Factory, desc: "Shift management, overtime tracking, and workforce insights." },
];

export default function SolutionsPage() {
  return (
    <PageShell
      title="Solutions"
      subtitle="Industry-ready solutions with workflow templates, analytics, and secure enterprise architecture."
    >
      <div className={cn(marketingSurface, "mb-4 p-6")}>
        <div className={cn("text-base font-semibold", marketingStrong)}>Workflow blueprints</div>
        <p className={cn("mt-2 text-sm", marketingBody)}>
          Each solution includes approvals, automation rules, and reporting templates—ready to adapt to your org.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Attendance + shift policies", "Leave approvals + audit trail", "Payroll insights + exports"].map((x) => (
            <div key={x} className={cn(marketingInset, "flex items-center gap-2 text-sm", marketingList)}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {x}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((i) => (
          <section key={i.id} id={i.id} className={cn(marketingSurface, "p-6")}>
            <div className="flex items-center gap-3">
              <div className={cn(marketingInset, "flex h-11 w-11 shrink-0 items-center justify-center border-0 p-0")}>
                <i.icon className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" />
              </div>
              <div className={cn("text-base font-semibold", marketingStrong)}>{i.title}</div>
            </div>
            <p className={cn("mt-3 text-sm", marketingBody)}>{i.desc}</p>
            <SolutionWorkflowPreview solutionId={i.id} title={i.title} />
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/contact#book-demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-2 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
              >
                Request a demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
