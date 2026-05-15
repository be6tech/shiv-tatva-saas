"use client";

import type { ReactNode, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { GOOGLE_MAPS_OFFICE_URL, OFFICE_LOCATION_FALLBACK, BE6_MODERN_TECH_URL } from "@/lib/site-urls";

function SvgFb(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function SvgX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function SvgIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function SvgIg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function SvgGh(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function SocialIcon({
  href,
  label,
  children,
  isDark,
}: {
  href: string;
  label: string;
  children: ReactNode;
  isDark?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition",
        isDark
          ? "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10 dark:hover:text-white"
          : "bg-muted/50 text-muted-foreground ring-1 ring-border hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </a>
  );
}

export function Footer({ variant = "default" }: { variant?: "default" | "dark" }) {
  const isDark = variant === "dark";

  if (isDark) {
    return (
      <footer className="border-t border-border bg-gradient-to-b from-slate-100 to-white text-slate-700 dark:border-white/10 dark:from-[#05070d] dark:to-[#070a12] dark:text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-200/80 dark:border-white/10 dark:bg-white/[0.06] dark:ring-white/10">
                  <Image
                    src="/brand/shivtatva-logo.png"
                    alt="Shiv Tatva Solutions"
                    fill
                    className="object-contain p-1.5"
                    sizes="44px"
                  />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Shiv Tatva</div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500">
                    SOLUTIONS PVT LTD
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                AI-powered enterprise SaaS solutions for modern business automation, workforce
                management, and digital transformation.
              </p>
              <div className="mt-6 space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#f97316]" />
                  <a href="mailto:info@shivtatva.com" className="hover:text-slate-900 dark:hover:text-white">
                    info@shivtatva.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#f97316]" />
                  <span>+91 94407 08630</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#f97316]" />
                  <a
                    href={GOOGLE_MAPS_OFFICE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    {OFFICE_LOCATION_FALLBACK}
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Products</div>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {["HRMS", "CRM", "ERP", "Payroll", "AI Analytics"].map((t) => (
                    <li key={t}>
                      <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href={`/products#${t.toLowerCase().replace(" ", "-")}`}>
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Company</div>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/solutions">
                      Solutions
                    </Link>
                  </li>
                  <li>
                    <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/careers">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/contact">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Resources</div>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/learning">
                      Learning
                    </Link>
                  </li>
                  <li>
                    <a
                      href={BE6_MODERN_TECH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      BE6 Modern Tech
                    </a>
                  </li>
                  <li>
                    <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/privacy">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/terms">
                      Terms & Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Newsletter</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Get product updates & insights.</p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#f97316]/50"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white shadow-lg shadow-orange-500/25 transition hover:opacity-95"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                <SocialIcon href="#" label="Facebook" isDark>
                  <SvgFb className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="Twitter" isDark>
                  <SvgX className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="LinkedIn" isDark>
                  <SvgIn className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="Instagram" isDark>
                  <SvgIg className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="GitHub" isDark>
                  <SvgGh className="h-4 w-4" />
                </SocialIcon>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-8 text-xs text-slate-500 dark:border-white/10 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Shiv Tatva Solutions Pvt Ltd. All rights reserved.</div>
            <div>
              Powered by <span className="font-semibold text-[#f97316]">AI</span> • Built for Enterprise
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="text-lg font-semibold text-foreground">Shiv Tatva Solutions Private Limited</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Premium AI-powered enterprise SaaS for HRMS, automation, analytics, and digital
              transformation—built for scale, security, and modern teams.
            </p>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#F57C00]" />
                <a href="mailto:info@shivtatva.com" className="hover:text-foreground">
                  info@shivtatva.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#F57C00]" />
                <span>+91 94407 08630</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#F57C00]" />
                <a
                  href={GOOGLE_MAPS_OFFICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {OFFICE_LOCATION_FALLBACK}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm font-semibold text-foreground">Products</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/products#hrms">
                    HRMS
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/products#crm">
                    CRM
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/products#erp">
                    ERP
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/products#ai-analytics">
                    AI Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground">Quick Links</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/solutions">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/careers">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/contact">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/login">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground">Resources</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/solutions">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/learning">
                    Learning
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-foreground" href="/contact#book-demo">
                    Book Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <a
                href={BE6_MODERN_TECH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-foreground hover:text-[#F57C00]"
              >
                BE6 Modern Tech
              </a>
              <p className="mt-3 text-sm text-muted-foreground">
                Full 6-month program, modules, and applications on{" "}
                <a
                  href={BE6_MODERN_TECH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-2 hover:underline"
                >
                  be6moderntech.com
                </a>
                . This site lists Shiv Tatva learning highlights only—use Contact for partnership questions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shiv Tatva Solutions Private Limited. All rights reserved.
          </div>
          <div className="flex gap-4 text-xs">
            <Link className="text-muted-foreground hover:text-foreground" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/terms">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
