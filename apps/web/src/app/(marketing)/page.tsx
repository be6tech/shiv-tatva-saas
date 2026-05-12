"use client";

import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Shield,
  Globe,
  Brain,
  Lock,
  Cloud,
  BarChart3,
  Users,
  ArrowRight,
  PlayCircle,
  Zap,
  Briefcase,
  DollarSign,
  CalendarClock,
  Link2,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardSpring = { type: "spring" as const, stiffness: 400, damping: 28 };

const shell = cn(
  "rounded-2xl border p-5 shadow-sm transition will-change-transform",
  "border-border/80 bg-white hover:border-orange-200/70 hover:shadow-md",
  "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/[0.05]"
);

const sectionLine = "border-b border-border/70 dark:border-white/5";

const trusted = ["TATA", "INFOSYS", "WIPRO", "RELIANCE", "HDFC", "ICICI", "ADANI"];

const suite = [
  {
    title: "HRMS",
    desc: "Complete human resource management with employee lifecycle automation.",
    icon: Users,
    iconBg: "bg-blue-500",
  },
  {
    title: "CRM",
    desc: "Smart customer relationship pipelines powered by AI insights.",
    icon: Briefcase,
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
  },
  {
    title: "ERP",
    desc: "Integrated enterprise resource planning for end-to-end operations.",
    icon: BarChart3,
    iconBg: "bg-orange-500",
  },
  {
    title: "Payroll",
    desc: "Automated payroll, taxation & compliance across geographies.",
    icon: DollarSign,
    iconBg: "bg-emerald-500",
  },
];

const stories = [
  {
    quote:
      "Shiv Tatva's HRMS reduced our onboarding time by 70%. The AI insights are game-changing.",
    name: "Anjali Sharma",
    role: "CHRO, TechVeda",
  },
  {
    quote: "ERP & Payroll integration saved us 40 hours/week. ROI realized within 3 months.",
    name: "Rohit Kumar",
    role: "CFO, Bharat Industries",
  },
  {
    quote: "Best enterprise SaaS we've adopted. Premium UI, world-class support, AI-first approach.",
    name: "Priya Verma",
    role: "CEO, EduPrime",
  },
];

const techFeatures = [
  {
    title: "Attendance System",
    desc: "Biometric, GPS & facial-recognition attendance tracking.",
    icon: CalendarClock,
    iconBg: "bg-orange-500",
  },
  {
    title: "AI Analytics",
    desc: "Predictive insights, anomaly detection & smart dashboards.",
    icon: Brain,
    iconBg: "bg-purple-600",
  },
  {
    title: "Workflow Automation",
    desc: "No-code workflow builder for any business process.",
    icon: Link2,
    iconBg: "bg-cyan-500",
  },
  {
    title: "Cloud Infrastructure",
    desc: "Enterprise-grade cloud with 99.99% uptime guarantee.",
    icon: Cloud,
    iconBg: "bg-blue-500",
  },
];

const whyItems = [
  {
    title: "ISO 27001 & SOC 2 Certified",
    desc: "Bank-grade security with end-to-end encryption.",
    icon: Shield,
  },
  {
    title: "Multi-region Cloud Deployment",
    desc: "Deploy in India, US, EU with data residency control.",
    icon: Globe,
  },
  {
    title: "Native AI Across All Modules",
    desc: "GPT-powered automations & predictive analytics built-in.",
    icon: Brain,
  },
  {
    title: "Compliance-Ready",
    desc: "GDPR, HIPAA, DPDP — audit reports in one click.",
    icon: Lock,
  },
];

const stats = [
  { value: "100+", label: "Enterprise Clients" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7", label: "Premium Support" },
  { value: "50+", label: "AI Models Deployed" },
];

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-[#f97316] text-[#f97316]" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500/25 dark:bg-[#070a12] dark:text-slate-100 dark:selection:bg-orange-500/30">
      <Navbar appearance="landing" />

      <main>
        {/* Hero */}
        <section className={cn("relative overflow-hidden", sectionLine)}>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15,23,42,0.09) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden opacity-[0.35] dark:block"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(249,115,22,.35), transparent 55%), radial-gradient(circle at 70% 40%, rgba(59,130,246,.2), transparent 60%)",
            }}
            animate={{ opacity: [0.45, 0.65, 0.45], scale: [1, 1.04, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 hidden h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl dark:block"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(249,115,22,.45), transparent 55%), radial-gradient(circle at 70% 40%, rgba(30,58,138,.5), transparent 60%)",
            }}
            animate={{ opacity: [0.35, 0.5, 0.35], scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.h1
                  variants={fadeUp}
                  className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.15rem] dark:text-white"
                >
                  Transforming Businesses Through{" "}
                  <span className="bg-gradient-to-r from-[#ea580c] via-[#f97316] to-sky-600 bg-clip-text text-transparent dark:from-[#f97316] dark:via-[#fb923c] dark:to-sky-400">
                    Intelligent SaaS
                  </span>{" "}
                  Solutions
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400"
                >
                  AI-powered enterprise software for modern business automation, workforce management,
                  analytics, and digital transformation — trusted by 100+ enterprises across India.
                </motion.p>
                <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={cardSpring}>
                    <Link
                      href="/pricing"
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(249,115,22,.28)] transition hover:opacity-95 dark:shadow-[0_16px_40px_rgba(249,115,22,.35)]"
                    >
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={cardSpring}>
                    <Link
                      href="/contact#book-demo"
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:shadow-none dark:backdrop-blur-sm dark:hover:bg-white/10"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Book Demo
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28, rotateX: 4 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="relative [perspective:1200px]"
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-3xl border shadow-lg ring-1",
                    "border-slate-200/90 bg-white ring-slate-200/50",
                    "dark:border-white/10 dark:bg-[#0c1018]/90 dark:shadow-[0_40px_100px_rgba(0,0,0,.55)] dark:ring-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-white/10 dark:bg-black/40">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { k: "Revenue", v: "₹12.4L", d: "+12.4%" },
                        { k: "Active Users", v: "8,420", d: "+8.1%" },
                        { k: "Tasks", v: "342", d: "84 done" },
                      ].map((x) => (
                        <div
                          key={x.k}
                          className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                        >
                          <div className="text-[11px] text-slate-500 dark:text-slate-500">{x.k}</div>
                          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{x.v}</div>
                          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">{x.d}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                        <span>Performance Analytics</span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-[#f97316]/15 dark:text-[#fdba74]">
                          AI Insights
                        </span>
                      </div>
                      <div className="mt-4 h-24 rounded-lg bg-gradient-to-t from-orange-100/90 to-transparent dark:from-[#f97316]/20">
                        <svg viewBox="0 0 400 80" className="h-full w-full" preserveAspectRatio="none">
                          <path
                            d="M0,60 Q80,20 160,45 T320,25 L400,15 L400,80 L0,80 Z"
                            fill="url(#heroGrad)"
                            opacity="0.92"
                          />
                          <defs>
                            <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#38bdf8" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="text-[11px] text-slate-500 dark:text-slate-500">Weekly Activity</div>
                        <div className="mt-3 flex h-16 items-end gap-1">
                          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 4, opacity: 0.3 }}
                              whileInView={{ height: `${h}%`, opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              className="flex-1 rounded-sm bg-gradient-to-t from-sky-500/50 to-sky-400 dark:from-sky-600/40 dark:to-sky-400/90"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="text-[11px] text-slate-500 dark:text-slate-500">Team Online</div>
                        <div className="mt-3 flex items-center gap-2">
                          {["AS", "RK", "MJ", "PV"].map((x) => (
                            <div
                              key={x}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-purple-600 text-[10px] font-bold text-white"
                            >
                              {x}
                            </div>
                          ))}
                          <span className="ml-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-white/10 dark:text-slate-400">
                            +12
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">17 members active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trusted + platform */}
        <section className={cn("py-16 sm:py-20", sectionLine)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500"
            >
              Trusted by 100+ enterprises worldwide
            </motion.p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {trusted.map((name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.04, duration: 0.45 }}
                  whileHover={{ scale: 1.06, color: "inherit" }}
                  className="text-sm font-semibold tracking-wide text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 sm:text-base"
                >
                  {name}
                </motion.span>
              ))}
            </div>

            <motion.div
              className="mx-auto mt-16 max-w-4xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900 dark:border-[#f97316]/45 dark:bg-[#f97316]/10 dark:text-[#fdba74]"
              >
                <Zap className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
                All-In-One Platform
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] dark:text-white"
              >
                <span className="text-slate-900 dark:text-white">One platform.</span>{" "}
                <span className="text-[#ea580c] dark:text-[#f97316]">Every</span>{" "}
                <span className="bg-gradient-to-r from-amber-600 to-[#ea580c] bg-clip-text text-transparent dark:from-amber-300 dark:to-[#f97316]">
                  business
                </span>{" "}
                <span className="bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-violet-400">
                  need.
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                Business suites and day-to-day operations—both live under one platform: HRMS, CRM, ERP, and Payroll, plus
                attendance, AI analytics, workflow automation, and enterprise cloud. No stitched vendors.
              </motion.p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suite.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  className={shell}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.iconBg} text-white shadow-lg`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{s.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {techFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.45 }}
                  whileHover={{ y: -4 }}
                  className={shell}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg} text-white shadow-lg`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{f.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={cn("py-16 sm:py-20", sectionLine)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900 dark:border-[#f97316]/40 dark:bg-[#f97316]/10 dark:text-[#fdba74]"
              >
                <Star className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
                Customer Stories
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
              >
                Loved by <span className="text-[#ea580c] dark:text-[#f97316]">teams</span>{" "}
                <span className="bg-gradient-to-r from-sky-600 to-slate-900 bg-clip-text text-transparent dark:from-sky-300 dark:to-white">
                  worldwide
                </span>
              </motion.h2>
            </motion.div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {stories.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  whileHover={{ y: -4 }}
                  className={cn(shell, "flex flex-col")}
                >
                  <StarRow />
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    &ldquo;{s.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#f97316] to-purple-600" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">{s.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose + stats */}
        <section className={cn("py-16 sm:py-20", sectionLine)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={stagger}
              >
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900 dark:border-[#f97316]/40 dark:bg-[#f97316]/10 dark:text-[#fdba74]"
                >
                  ✨ Why Choose Us
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white"
                >
                  The most trusted SaaS for{" "}
                  <span className="bg-gradient-to-r from-[#ea580c] to-amber-500 bg-clip-text text-transparent dark:from-[#f97316] dark:to-amber-300">
                    enterprise
                  </span>{" "}
                  <span className="bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-violet-400">
                    scale
                  </span>
                </motion.h2>
                <motion.p variants={fadeUp} className="mt-4 text-slate-600 dark:text-slate-400">
                  Built for security, designed for scale, optimized with AI — Shiv Tatva powers the
                  operations of India&apos;s fastest-growing enterprises.
                </motion.p>
                <ul className="mt-8 space-y-6">
                  {whyItems.map((w, i) => (
                    <motion.li
                      key={w.title}
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.45 }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 dark:border-[#f97316]/40 dark:bg-[#f97316]/10">
                        <w.icon className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{w.title}</div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{w.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((st, i) => (
                  <motion.div
                    key={st.label}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 22 }}
                    whileHover={{ y: -3 }}
                    className={cn(shell, "p-5 text-center sm:p-6")}
                  >
                    <div className="bg-gradient-to-r from-[#ea580c] to-amber-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl dark:from-[#f97316] dark:to-amber-300">
                      {st.value}
                    </div>
                    <div className="mt-2 text-xs text-slate-500 sm:text-sm dark:text-slate-500">{st.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-md dark:border-white/10 dark:bg-[#0c1018] dark:shadow-none sm:px-12 sm:py-16"
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-90"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 50% 80%, rgba(249,115,22,.18), transparent 60%)",
                }}
                animate={{ opacity: [0.55, 0.85, 0.55] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  Ready to transform your business?
                </h2>
                <p className="mt-4 text-slate-600 dark:text-slate-400">
                  Join 100+ enterprises automating with Shiv Tatva. Start your free trial today — no
                  credit card required.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={cardSpring}>
                    <Link
                      href="/pricing"
                      className="inline-flex w-full min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(249,115,22,.3)] transition hover:opacity-95 sm:w-auto dark:shadow-[0_14px_40px_rgba(249,115,22,.4)]"
                    >
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={cardSpring}>
                    <Link
                      href="/contact"
                      className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                    >
                      Talk to Sales
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
