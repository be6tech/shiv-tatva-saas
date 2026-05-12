"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Cloud,
  Database,
  Brain,
  Lock,
  Code2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { techStack, type TechCategory } from "@/data/tech-stack";

const categoryIcons: Record<TechCategory, React.ComponentType<{ className?: string }>> =
  {
    Frontend: Code2,
    Backend: Shield,
    Databases: Database,
    "Cloud & DevOps": Cloud,
    "AI & Automation": Brain,
    Security: Lock,
  };

const categories: TechCategory[] = [
  "Frontend",
  "Backend",
  "Databases",
  "Cloud & DevOps",
  "AI & Automation",
  "Security",
];

function ProficiencyBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="mt-3 h-2 rounded-full bg-muted/50 overflow-hidden ring-1 ring-border">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${v}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-[#0B1F3A] via-[#F57C00] to-[#ffb26b]"
      />
    </div>
  );
}

export function TechStackSection() {
  const [active, setActive] = React.useState<TechCategory>("Frontend");
  const items = techStack.filter((t) => t.category === active);
  const ActiveIcon = categoryIcons[active] ?? Sparkles;

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Technologies We Use</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Built using enterprise-grade modern technologies
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Scalable, secure, cloud-native architecture across frontend, backend,
              databases, DevOps, AI automation, and security.
            </p>
          </div>
          <div className="glass rounded-2xl p-3 flex flex-wrap gap-2">
            {categories.map((c) => {
              const Icon = categoryIcons[c];
              const isActive = c === active;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ring-1",
                    isActive
                      ? "bg-muted ring-border text-foreground"
                      : "bg-muted/40 ring-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 text-[#F57C00]" />
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4 glass rounded-3xl p-7 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(245,124,0,.45), transparent 60%), radial-gradient(circle at 80% 30%, rgba(11,31,58,.85), transparent 65%)",
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground ring-1 ring-border bg-muted/40">
                <ActiveIcon className="h-3.5 w-3.5 text-[#F57C00]" />
                {active}
              </div>
              <div className="mt-4 text-xl font-semibold text-foreground">Enterprise readiness</div>
              <p className="mt-3 text-sm text-muted-foreground">
                Each stack choice maps to scalability, security, developer velocity,
                and cloud-native deployment patterns.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  { label: "Scalability", value: 92 },
                  { label: "Security", value: 90 },
                  { label: "Reliability", value: 88 },
                  { label: "DX & Velocity", value: 86 },
                ].map((k) => (
                  <div key={k.label} className="rounded-2xl bg-muted/40 ring-1 ring-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{k.label}</div>
                      <div className="text-xs text-muted-foreground">{k.value}%</div>
                    </div>
                    <ProficiencyBar value={k.value} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
            {items.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                className="glass rounded-3xl p-6 hover:bg-muted/40 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-foreground">{t.name}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-muted/50 ring-1 ring-border flex items-center justify-center">
                    <ActiveIcon className="h-5 w-5 text-[#F57C00]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Proficiency</span>
                  <span>{t.proficiency}%</span>
                </div>
                <ProficiencyBar value={t.proficiency} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

