"use client";

import { PageShell } from "@/components/marketing/page-shell";
import {
  marketingSurface,
  marketingInset,
  marketingBody,
  marketingStrong,
  marketingMuted,
  marketingInput,
  marketingTextarea,
} from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";
import { Briefcase, Rocket, Users, Send, Sparkles } from "lucide-react";
import * as React from "react";
import { apiFetch } from "@/lib/api";

const openings = [
  { title: "Full Stack Developer", type: "Full-time", location: "Hybrid", dept: "Engineering" },
  { title: "UI/UX Designer", type: "Full-time", location: "Remote", dept: "Design" },
  { title: "HR Executive", type: "Full-time", location: "On-site", dept: "HR" },
  { title: "Intern - React / Next.js", type: "Internship", location: "Remote", dept: "Learning" },
];

export default function CareersPage() {
  const [role, setRole] = React.useState(openings[0]!.title);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [portfolio, setPortfolio] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const apply = React.useCallback(() => {
    setSubmitting(true);
    setOk(null);
    setError(null);
    const bodyMsg = [
      `Role: ${role}`,
      phone ? `Phone: ${phone}` : null,
      portfolio ? `Portfolio/LinkedIn: ${portfolio}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    apiFetch<{ ok: boolean; leadId: string }>("/public/leads", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        company: "Candidate",
        phone: phone || undefined,
        message: bodyMsg,
        source: "careers",
      }),
    })
      .then((r) => {
        setOk(`Application received. Ref: ${r.leadId}`);
        setName("");
        setEmail("");
        setPhone("");
        setPortfolio("");
        setMessage("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to submit application"))
      .finally(() => setSubmitting(false));
  }, [role, name, email, phone, portfolio, message]);

  return (
    <PageShell
      title="Careers"
      subtitle="Join a team building premium, AI-powered enterprise software with modern engineering culture."
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {[
            { title: "Modern Culture", icon: Users, desc: "Collaborative, product-driven teams with ownership." },
            { title: "Ship Fast", icon: Rocket, desc: "Cloud-native delivery with automation and best practices." },
            { title: "Grow Your Career", icon: Briefcase, desc: "Mentorship, learning programs, and meaningful work." },
          ].map((c) => (
            <div key={c.title} className={cn(marketingSurface, "p-6")}>
              <div className="flex items-center gap-3">
                <div className={cn(marketingInset, "flex h-11 w-11 shrink-0 items-center justify-center border-0 p-0")}>
                  <c.icon className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" />
                </div>
                <div className={cn("text-base font-semibold", marketingStrong)}>{c.title}</div>
              </div>
              <p className={cn("mt-3 text-sm", marketingBody)}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="lg:col-span-7">
          <div className={cn(marketingSurface, "p-6")}>
            <div className={cn("text-base font-semibold", marketingStrong)}>Open Roles</div>
            <div className="mt-4 grid gap-3">
              {openings.map((o) => (
                <div key={o.title} className={cn(marketingInset, "p-4")}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={cn("font-semibold", marketingStrong)}>{o.title}</div>
                      <div className={cn("mt-1 text-xs", marketingMuted)}>
                        {o.dept} • {o.type} • {o.location}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRole(o.title)}
                      className="rounded-full bg-orange-500/15 px-3 py-1 text-xs text-orange-900 ring-1 ring-orange-500/25 transition hover:bg-orange-500/20 dark:text-amber-200 dark:ring-orange-400/30"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(marketingSurface, "mt-4 p-6")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={cn("text-base font-semibold", marketingStrong)}>Apply now</div>
                <div className={cn("mt-1 text-sm", marketingBody)}>
                  This application submits into the Admin Leads inbox instantly.
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs text-slate-700 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
                Auto-routing enabled
              </div>
            </div>

            {ok ? (
              <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90">
                {ok}
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200/80 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100/90">
                {error}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select
                className={cn(marketingInput, "sm:col-span-2")}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {openings.map((o) => (
                  <option key={o.title} value={o.title} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                    {o.title}
                  </option>
                ))}
              </select>
              <input
                className={marketingInput}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className={marketingInput}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className={marketingInput}
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                className={marketingInput}
                placeholder="Portfolio / LinkedIn URL (optional)"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
              <textarea
                className={cn(marketingTextarea, "sm:col-span-2")}
                placeholder="Tell us about your experience, projects, and what you want to build."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="button"
                onClick={apply}
                disabled={
                  submitting || name.trim().length < 2 || !email.includes("@") || message.trim().length < 20
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:from-[#f97316] dark:to-amber-400 sm:col-span-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit application"}
              </button>
              <p className={cn(marketingMuted, "text-xs sm:col-span-2")}>
                Prefer email? Send your resume to{" "}
                <span className="font-medium text-slate-900 dark:text-white">careers@shivtatva.com</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
