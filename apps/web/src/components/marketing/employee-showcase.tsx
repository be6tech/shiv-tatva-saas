"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { employees, type Employee } from "@/data/employees";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Building2,
  Briefcase,
  Award,
  Link2,
  Mail,
  Calendar,
  Sparkles,
  LayoutGrid,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  marketingSurface,
  marketingSurfaceHover,
  marketingBody,
  marketingStrong,
  marketingMuted,
  marketingInput,
} from "@/components/marketing/marketing-styles";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  const tone =
    status === "Active"
      ? "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/30"
      : status === "Team Lead"
      ? "bg-orange-100 text-orange-900 ring-orange-200 dark:bg-orange-500/15 dark:text-amber-200 dark:ring-orange-500/30"
      : status === "Senior Developer"
      ? "bg-slate-200 text-slate-900 ring-slate-300 dark:bg-slate-800/80 dark:text-slate-100 dark:ring-white/15"
      : status === "HR Manager"
      ? "bg-amber-100 text-amber-950 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/30"
      : "bg-slate-100 text-slate-800 ring-slate-200 dark:bg-white/10 dark:text-slate-100 dark:ring-white/15";

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs ring-1", tone)}>
      <span className="mr-2 h-2 w-2 rounded-full bg-[#ea580c] shadow-[0_0_12px_rgba(234,88,12,.5)] dark:bg-[#f97316]" />
      {status}
    </span>
  );
}

const selectClass = cn(marketingInput, "h-11 rounded-2xl px-4");

export function EmployeeShowcase() {
  const [viewTab, setViewTab] = React.useState<"directory" | "departments">("directory");
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState("All");
  const [desig, setDesig] = React.useState("All");
  const [selected, setSelected] = React.useState<Employee | null>(null);

  const departments = React.useMemo(() => {
    const set = new Set(employees.map((e) => e.department));
    return ["All", ...Array.from(set).sort()];
  }, []);
  const designations = React.useMemo(() => {
    const set = new Set(employees.map((e) => e.designation));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const filtered = employees.filter((e) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.skills.some((s) => s.toLowerCase().includes(q));
    const matchesDept = dept === "All" ? true : e.department === dept;
    const matchesDesig = desig === "All" ? true : e.designation === desig;
    return matchesQuery && matchesDept && matchesDesig;
  });

  const byDepartment = React.useMemo(() => {
    const m = new Map<string, Employee[]>();
    for (const e of filtered) {
      const list = m.get(e.department) ?? [];
      list.push(e);
      m.set(e.department, list);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const stats = React.useMemo(() => {
    const total = employees.length;
    const departmentsCount = new Set(employees.map((e) => e.department)).size;
    const activeProjects = 14;
    return { total, departmentsCount, activeProjects };
  }, []);

  const optClass = "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100";

  return (
    <section className="relative border-b border-border/70 py-16 dark:border-white/5 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className={cn("text-sm font-medium", marketingMuted)}>Our Team & Employee Details</div>
            <h2 className={cn("mt-2 text-3xl font-semibold tracking-tight", marketingStrong)}>
              Meet the professionals driving innovation
            </h2>
            <p className={cn("mt-3 max-w-2xl", marketingBody)}>
              Public team showcase to build trust and highlight workforce strength at Shiv Tatva Solutions Pvt Ltd.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Total Employees", value: stats.total },
              { label: "Departments", value: stats.departmentsCount },
              { label: "Active Projects", value: stats.activeProjects },
            ].map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
                className={cn(marketingSurface, "rounded-2xl p-4")}
              >
                <div className={cn("text-xs", marketingMuted)}>{s.label}</div>
                <div className={cn("mt-1 text-lg font-semibold", marketingStrong)}>{s.value}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className={cn(marketingSurface, "mt-10 inline-flex w-full flex-wrap gap-1 p-1.5 sm:w-auto")}
          role="tablist"
          aria-label="Employee details views"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewTab === "directory"}
            onClick={() => setViewTab("directory")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:flex-none",
              viewTab === "directory"
                ? "bg-orange-500/15 text-[#ea580c] shadow-sm ring-1 ring-orange-500/25 dark:bg-orange-500/10 dark:text-[#f97316] dark:ring-orange-500/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
            Directory
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewTab === "departments"}
            onClick={() => setViewTab("departments")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:flex-none",
              viewTab === "departments"
                ? "bg-orange-500/15 text-[#ea580c] shadow-sm ring-1 ring-orange-500/25 dark:bg-orange-500/10 dark:text-[#f97316] dark:ring-orange-500/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            )}
          >
            <Network className="h-4 w-4 shrink-0" aria-hidden />
            By department
          </button>
        </div>

        <div className={cn(marketingSurface, "mt-4 p-5")}>
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", marketingMuted)} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={cn(marketingInput, "rounded-2xl pl-11")}
                  placeholder="Search by name, ID, or skills…"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              <select value={dept} onChange={(e) => setDept(e.target.value)} className={selectClass}>
                {departments.map((d) => (
                  <option key={d} value={d} className={optClass}>
                    {d}
                  </option>
                ))}
              </select>
              <select value={desig} onChange={(e) => setDesig(e.target.value)} className={selectClass}>
                {designations.map((d) => (
                  <option key={d} value={d} className={optClass}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {viewTab === "directory" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className={cn(marketingSurface, "col-span-full p-8 text-center text-sm", marketingBody)}>
              No team members match your filters.
            </div>
          ) : (
            filtered.map((e, idx) => (
            <motion.button
              key={e.id}
              type="button"
              onClick={() => setSelected(e)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: idx * 0.03 }}
              className={cn(marketingSurfaceHover, "p-6 text-left")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-slate-800 to-[#ea580c] font-semibold text-white ring-1 ring-black/10 dark:from-[#0B1F3A] dark:to-[#f97316] dark:ring-white/10">
                    {initials(e.name)}
                  </div>
                  <div>
                    <div className={cn("text-base font-semibold", marketingStrong)}>{e.name}</div>
                    <div className={cn("mt-1 text-xs", marketingMuted)}>{e.id}</div>
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <div className={cn("inline-flex items-center gap-2", marketingBody)}>
                  <Briefcase className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                  {e.designation}
                </div>
                <div className={cn("inline-flex items-center gap-2", marketingBody)}>
                  <Building2 className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                  {e.department}
                </div>
                <div className={cn("text-xs", marketingMuted)}>
                  Skills: <span className="text-slate-800 dark:text-slate-200">{e.skills.join(" • ")}</span>
                </div>
                <div className={cn("text-xs", marketingMuted)}>
                  Email: <span className="text-slate-800 dark:text-slate-200">{e.email}</span>
                </div>
              </div>
            </motion.button>
            ))
          )}
        </div>
        ) : (
        <div className="mt-6 space-y-6">
          {byDepartment.length === 0 ? (
            <div className={cn(marketingSurface, "p-8 text-center text-sm", marketingBody)}>
              No team members match your filters.
            </div>
          ) : (
            byDepartment.map(([deptName, list]) => (
              <div key={deptName} className={cn(marketingSurface, "overflow-hidden p-0")}>
                <div className="flex items-center justify-between border-b border-border/70 bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" aria-hidden />
                    <h3 className={cn("text-base font-semibold", marketingStrong)}>{deptName}</h3>
                  </div>
                  <span className={cn("text-xs", marketingMuted)}>
                    {list.length} {list.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <ul className="divide-y divide-border/60 dark:divide-white/10">
                  {list.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(e)}
                        className={cn(
                          "flex w-full items-center gap-4 px-6 py-4 text-left transition",
                          "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-800 to-[#ea580c] text-sm font-semibold text-white ring-1 ring-black/10 dark:from-[#0B1F3A] dark:to-[#f97316] dark:ring-white/10">
                          {initials(e.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cn("font-medium", marketingStrong)}>{e.name}</div>
                          <div className={cn("mt-0.5 text-sm", marketingMuted)}>
                            {e.designation} · {e.id}
                          </div>
                        </div>
                        <StatusBadge status={e.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
        )}

        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? selected.name : undefined}>
          {selected ? (
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className={cn(marketingSurface, "p-6")}>
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-slate-800 to-[#ea580c] text-lg font-semibold text-white ring-1 ring-black/10 dark:from-[#0B1F3A] dark:to-[#f97316] dark:ring-white/10">
                      {initials(selected.name)}
                    </div>
                    <div>
                      <div className={cn("text-sm", marketingMuted)}>{selected.id}</div>
                      <div className={cn("mt-1 text-base font-semibold", marketingStrong)}>{selected.designation}</div>
                      <div className={cn("mt-1 text-sm", marketingBody)}>{selected.department}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <StatusBadge status={selected.status} />
                  </div>
                  <div className={cn("mt-5 space-y-2 text-sm", marketingBody)}>
                    <div className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                      {selected.email}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                      Joined: {selected.joiningDate}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Link2 className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                      {selected.linkedin ? "LinkedIn Profile" : "—"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 lg:col-span-7">
                <div className={cn(marketingSurface, "p-6")}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
                    Biography
                  </div>
                  <p className={cn("mt-4 text-sm leading-7", marketingBody)}>{selected.bio}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={cn(marketingSurface, "p-6")}>
                    <div className={cn("inline-flex items-center gap-2 text-sm font-semibold", marketingStrong)}>
                      <Award className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
                      Certifications
                    </div>
                    <ul className={cn("mt-3 space-y-2 text-sm", marketingBody)}>
                      {selected.certifications.length ? (
                        selected.certifications.map((c) => <li key={c}>{c}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                  <div className={cn(marketingSurface, "p-6")}>
                    <div className={cn("inline-flex items-center gap-2 text-sm font-semibold", marketingStrong)}>
                      <Briefcase className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
                      Projects
                    </div>
                    <ul className={cn("mt-3 space-y-2 text-sm", marketingBody)}>
                      {selected.projects.length ? (
                        selected.projects.map((p) => <li key={p}>{p}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className={cn(marketingSurface, "p-6")}>
                  <div className={cn("text-sm font-semibold", marketingStrong)}>Skills</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </section>
  );
}
