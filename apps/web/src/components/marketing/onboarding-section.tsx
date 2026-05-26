"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ClipboardCheck,
  FileCheck,
  KeyRound,
  Rocket,
  UserPlus,
  Users,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const shell = cn(
  "rounded-2xl border p-5 shadow-sm transition will-change-transform",
  "border-border/80 bg-white hover:border-orange-200/70 hover:shadow-md",
  "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/[0.05]"
);

const steps = [
  {
    step: "01",
    title: "Profile & portal access",
    desc: "Create employee ID, work email, and secure login for the employee portal.",
    icon: KeyRound,
  },
  {
    step: "02",
    title: "Documents & offer",
    desc: "Upload offer letter, ID proofs, and HR documents in one place.",
    icon: FileCheck,
  },
  {
    step: "03",
    title: "Policies & acknowledgements",
    desc: "Track policy reads, NDAs, and compliance sign-offs before day one.",
    icon: ClipboardCheck,
  },
  {
    step: "04",
    title: "Team & manager setup",
    desc: "Assign department, shift, reporting manager, and onboarding buddy.",
    icon: Users,
  },
  {
    step: "05",
    title: "Day-one readiness",
    desc: "Attendance, tasks, leave balance, and payslip access from first login.",
    icon: Rocket,
  },
];

type OnboardingSectionProps = {
  id?: string;
  className?: string;
};

export function OnboardingSection({ id = "onboarding", className }: OnboardingSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-20 border-b border-border/70 dark:border-white/5", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900 dark:border-[#f97316]/40 dark:bg-[#f97316]/10 dark:text-[#fdba74]"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
              Employee Onboarding
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Onboard new hires in{" "}
              <span className="bg-gradient-to-r from-[#ea580c] to-amber-500 bg-clip-text text-transparent dark:from-[#f97316] dark:to-amber-300">
                days, not weeks
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-lg text-slate-600 dark:text-slate-400">
              Shiv Tatva HRMS guides every step from offer acceptance to first-day attendance — with
              documents, approvals, and portal access in one workflow.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact#contact-form"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(249,115,22,.25)] transition hover:opacity-95"
              >
                Request a demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?tab=onboarding"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Start onboarding
              </Link>
            </motion.div>
          </div>

          <motion.ol variants={stagger} className="space-y-3">
            {steps.map((s) => (
              <motion.li
                key={s.step}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className={cn(shell, "flex gap-4")}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-amber-500 text-sm font-bold text-white">
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                    <span className="font-semibold text-slate-900 dark:text-white">{s.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>
    </section>
  );
}
