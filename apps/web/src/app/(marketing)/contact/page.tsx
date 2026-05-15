"use client";

import { PageShell } from "@/components/marketing/page-shell";
import {
  marketingSurface,
  marketingBody,
  marketingStrong,
  marketingMuted,
  marketingInput,
  marketingTextarea,
} from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";
import { Mail, Phone, MessageCircle, Calendar, MapPin, Send, ExternalLink } from "lucide-react";
import { GOOGLE_MAPS_OFFICE_URL, OFFICE_LOCATION_FALLBACK, OSM_OFFICE_MAP_EMBED_SRC } from "@/lib/site-urls";
import * as React from "react";
import { apiFetch } from "@/lib/api";
import { shouldUseHostedLeadsApi } from "@/lib/marketing-leads";

function isNetworkFailure(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : "";
  return (
    e instanceof TypeError ||
    msg === "Failed to fetch" ||
    msg.toLowerCase().includes("network") ||
    msg.toLowerCase().includes("load failed")
  );
}

async function mirrorToSupabase(payload: {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  lead_id: string | null;
}): Promise<boolean> {
  const res = await fetch("/api/integrations/supabase-contact-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, source: "contact" }),
  });
  return res.ok;
}

async function mirrorToGoogleSheet(payload: {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  source: string;
  lead_id: string | null;
}): Promise<boolean> {
  const res = await fetch("/api/integrations/google-sheet-contact-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return false;
  try {
    const data = (await res.json()) as { ok?: boolean; skipped?: boolean };
    if (data.skipped) return false;
    return data.ok === true;
  } catch {
    return true;
  }
}

async function mirrorContactIntegrations(leadId: string | null, payload: {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
}) {
  const row = { ...payload, lead_id: leadId, source: "contact" as const };
  await Promise.allSettled([mirrorToSupabase({ ...payload, lead_id: leadId }), mirrorToGoogleSheet(row)]);
}

export default function ContactPage() {
  const [publicSettings, setPublicSettings] = React.useState<{
    companyName?: string;
    supportEmail?: string;
    supportPhone?: string;
    locationText?: string;
  } | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<{ public: any }>("/public/settings")
      .then((r) => setPublicSettings(r.public ?? null))
      .catch(() => setPublicSettings(null));
  }, []);

  const onSubmit = React.useCallback(async () => {
    setSubmitting(true);
    setOk(null);
    setError(null);

    const payload = {
      name,
      email,
      company: company || null,
      phone: phone || null,
      message,
    };

    if (!shouldUseHostedLeadsApi()) {
      const fallbackRef = `web-${Date.now()}`;
      const supa = await mirrorToSupabase({ ...payload, lead_id: fallbackRef });
      const sheet = await mirrorToGoogleSheet({
        ...payload,
        lead_id: fallbackRef,
        source: "contact",
      }).catch(() => false);
      if (supa || sheet) {
        setOk("Your request was submitted successfully. We will contact you shortly.");
        setName("");
        setEmail("");
        setCompany("");
        setPhone("");
        setMessage("");
      } else {
        setError(
          "Could not save your request. In your hosting dashboard (e.g. Vercel → Environment Variables) add SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), and/or GOOGLE_CONTACT_SHEET_WEBAPP_URL, then redeploy. Optional: set NEXT_PUBLIC_API_BASE_URL to your public API gateway if you run one."
        );
      }
      setSubmitting(false);
      return;
    }

    try {
      const r = await apiFetch<{ ok: boolean; leadId: string }>("/public/leads", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          phone: phone || undefined,
          message,
          source: "contact",
        }),
      });
      await mirrorContactIntegrations(r.leadId, payload);
      setOk("Your request was submitted successfully. We will contact you shortly.");
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setMessage("");
    } catch (e) {
      if (isNetworkFailure(e)) {
        const fallbackRef = `web-${Date.now()}`;
        const supa = await mirrorToSupabase({ ...payload, lead_id: fallbackRef });
        const sheet = await mirrorToGoogleSheet({
          ...payload,
          lead_id: fallbackRef,
          source: "contact",
        }).catch(() => false);
        const saved = supa || sheet;
        if (saved) {
          setOk("Your request was submitted successfully. We will contact you shortly.");
          setName("");
          setEmail("");
          setCompany("");
          setPhone("");
          setMessage("");
        } else {
          setError(
            "Can't reach the API (leads service), and backup save failed. Local: run `npm run dev` from the project root (API on port 4000) or set NEXT_PUBLIC_API_BASE_URL. Deployed: set SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and/or GOOGLE_CONTACT_SHEET_WEBAPP_URL on your host, then redeploy."
          );
        }
      } else {
        setError(e instanceof Error ? e.message : "Failed to submit");
      }
    } finally {
      setSubmitting(false);
    }
  }, [name, email, company, phone, message]);

  return (
    <PageShell
      title="Contact"
      subtitle="Get in touch for a product walkthrough, proposal, or enterprise deployment."
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className={cn(marketingSurface, "p-6 lg:col-span-7")} id="contact-form">
          <div className={cn("text-base font-semibold", marketingStrong)}>Send a message</div>
          <div className="mt-5">
            {ok ? (
              <div className="mb-4 rounded-2xl border border-emerald-200/80 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90">
                {ok}
              </div>
            ) : null}
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200/80 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100/90">
                {error}
              </div>
            ) : null}
          </div>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <input
              className={marketingInput}
              placeholder="Full name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={marketingInput}
              placeholder="Work email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={cn(marketingInput, "sm:col-span-2")}
              placeholder="Company"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              className={cn(marketingInput, "sm:col-span-2")}
              placeholder="Phone (optional)"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className={cn(marketingTextarea, "sm:col-span-2")}
              placeholder="Tell us what you want to build (HRMS, attendance, automation, analytics...)"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || name.trim().length < 2 || !email.includes("@") || message.trim().length < 10}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:from-[#f97316] dark:to-amber-400 sm:col-span-2"
            >
              {submitting ? <Calendar className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Send message"}
            </button>
            <p className={cn(marketingMuted, "text-xs sm:col-span-2")}>
              Submissions are saved; ganeshbandaru800@gmail.com is notified by email when the lead is
              received. Admin notifications also appear in the dashboard when the leads API is online.
            </p>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className={cn(marketingSurface, "p-6")}>
            <div className={cn("text-base font-semibold", marketingStrong)}>Direct channels</div>
            <div className={cn("mt-4 space-y-3 text-sm", marketingBody)}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                {publicSettings?.supportEmail ?? "info@shivtatva.com"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                {publicSettings?.supportPhone ?? "+91 94407 08630"}
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
                WhatsApp support (button integration)
              </div>
            </div>
          </div>

          <div className={cn(marketingSurface, "p-6")}>
            <div className={cn("text-base font-semibold", marketingStrong)}>Location</div>
            <div className={cn("mt-3 flex items-center gap-2 text-sm", marketingBody)}>
              <MapPin className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-[#f97316]" />
              {publicSettings?.locationText ?? OFFICE_LOCATION_FALLBACK}
            </div>
            <a
              href={GOOGLE_MAPS_OFFICE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View office location on Google Maps (opens in a new tab)"
              className={cn(
                "group relative mt-4 block aspect-video w-full overflow-hidden rounded-2xl border border-border/80 text-center shadow-sm transition",
                "hover:border-orange-200/80 dark:border-white/10 dark:hover:border-white/20"
              )}
            >
              <iframe
                title="Cohort Coworking Space, Kondapur — map preview"
                src={OSM_OFFICE_MAP_EMBED_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] border-0"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/20 dark:from-[#070a12] dark:via-[#070a12]/80 dark:to-transparent"
                aria-hidden
              />
              <span className="absolute inset-0 flex flex-col items-center justify-end gap-2 px-6 pb-8 pt-16">
                <MapPin className="h-9 w-9 text-[#ea580c] dark:text-[#f97316]" aria-hidden />
                <span className="font-serif text-lg font-semibold tracking-tight text-white">View on Google Maps</span>
                <span className="inline-flex items-center gap-1 text-xs font-normal text-slate-400 group-hover:text-slate-200">
                  Opens in a new tab
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
