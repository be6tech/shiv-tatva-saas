"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { employees } from "@/data/employees";
import { Search, Briefcase, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  marketingSurface,
  marketingBody,
  marketingStrong,
  marketingMuted,
  marketingInput,
} from "@/components/marketing/marketing-styles";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function formatExperience(years: number) {
  if (years <= 0) return "Fresher";
  if (years === 1) return "1 year";
  return `${years} years`;
}

export function EmployeeShowcase() {
  const [query, setQuery] = React.useState("");

  const filtered = employees.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q)
    );
  });

  return (
    <section className="relative border-b border-border/70 py-16 dark:border-white/5 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            <div className={cn("text-sm font-medium", marketingMuted)}>Our Team</div>
            <h2 className={cn("mt-2 text-3xl font-semibold tracking-tight", marketingStrong)}>
              Meet the professionals driving innovation
            </h2>
            <p className={cn("mt-3", marketingBody)}>
              Shiv Tatva Solutions team — name, role, and experience.
            </p>
          </motion.div>
        </div>

        <div className={cn(marketingSurface, "mt-10 p-5")}>
          <div className="relative max-w-md">
            <Search className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", marketingMuted)} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(marketingInput, "rounded-2xl pl-11")}
              placeholder="Search by name or role…"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className={cn(marketingSurface, "col-span-full p-8 text-center text-sm", marketingBody)}>
              No team members match your search.
            </div>
          ) : (
            filtered.map((e, idx) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                className={cn(marketingSurface, "p-6")}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: idx * 0.03 }}
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-slate-800 to-[#ea580c] font-semibold text-white ring-1 ring-black/10 dark:from-[#0B1F3A] dark:to-[#f97316] dark:ring-white/10"
                  >
                    {initials(e.name)}
                  </motion.div>
                  <div className={cn("text-base font-semibold", marketingStrong)}>{e.name}</div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className={cn("inline-flex items-center gap-2", marketingBody)}>
                    <Briefcase className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                    <span className={marketingMuted}>Role:</span> {e.designation}
                  </div>
                  <div className={cn("inline-flex items-center gap-2", marketingBody)}>
                    <Clock className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                    <span className={marketingMuted}>Experience:</span> {formatExperience(e.experienceYears)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
