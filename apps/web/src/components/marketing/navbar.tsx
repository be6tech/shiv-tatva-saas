"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ChevronDown,
  LogIn,
  Menu,
  X,
  CalendarCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type NavItem = { label: string; href: string };

const products: NavItem[] = [
  { label: "HRMS Platform", href: "/products#hrms" },
  { label: "CRM Platform", href: "/products#crm" },
  { label: "ERP System", href: "/products#erp" },
  { label: "Payroll Management", href: "/products#payroll" },
  { label: "Employee Tracking", href: "/products#tracking" },
  { label: "AI Analytics Dashboard", href: "/products#ai-analytics" },
];

const solutions: NavItem[] = [
  { label: "Employee Onboarding", href: "/#onboarding" },
  { label: "Startups", href: "/solutions#startups" },
  { label: "Enterprises", href: "/solutions#enterprises" },
  { label: "Educational Institutions", href: "/solutions#education" },
  { label: "Healthcare", href: "/solutions#healthcare" },
  { label: "Retail", href: "/solutions#retail" },
  { label: "Manufacturing", href: "/solutions#manufacturing" },
];

const learning: NavItem[] = [
  { label: "Courses", href: "/learning#courses" },
  { label: "Internship Programs", href: "/learning#internships" },
  { label: "Certifications", href: "/learning#certifications" },
  { label: "Workshops", href: "/learning#workshops" },
];

function NavLink({
  href,
  label,
  isLanding,
}: {
  href: string;
  label: string;
  isLanding?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        active
          ? isLanding
            ? "text-[#ea580c] dark:text-[#f97316]"
            : "text-foreground"
          : isLanding
            ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

function Dropdown({
  label,
  items,
  isLanding,
}: {
  label: string;
  items: NavItem[];
  isLanding?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium transition-colors",
          isLanding
            ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={cn(
            "absolute left-0 top-[calc(100%+10px)] w-72 rounded-2xl border p-2 shadow-lg backdrop-blur-xl",
            isLanding
              ? "border-border bg-white/95 text-slate-800 shadow-xl dark:border-white/10 dark:bg-[#0c1018]/95 dark:text-slate-200"
              : "border-border bg-popover/95"
          )}
        >
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition",
                isLanding
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </Link>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}

export function Navbar({ appearance = "default" }: { appearance?: "default" | "landing" }) {
  const isLanding = appearance === "landing";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const blurAmount = useTransform(scrollY, [0, 40], [8, 18]);
  const backdropFilter = useMotionTemplate`blur(${blurAmount}px)`;
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  return (
    <motion.header
      style={{ backdropFilter }}
      className={cn(
        "sticky top-0 z-50 border-b",
        isLanding
          ? "border-border/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#070a12]/88 dark:shadow-none dark:supports-[backdrop-filter]:bg-[#070a12]/75"
          : "border-border bg-background/80 supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3" onClick={closeMobile}>
              <div
                className={cn(
                  "relative h-9 w-9 overflow-hidden rounded-xl ring-1",
                  isLanding ? "ring-border/80 bg-muted/30 dark:ring-white/15 dark:bg-white/5" : "ring-border bg-muted/40"
                )}
              >
                <Image
                  src="/brand/shivtatva-logo.png"
                  alt="Shiv Tatva Solutions"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <div
                  className={cn(
                    "text-sm font-semibold tracking-wide",
                    isLanding ? "text-slate-900 dark:text-white" : "text-foreground"
                  )}
                >
                  Shiv Tatva
                </div>
                <div className={cn("text-[11px]", isLanding ? "text-slate-500 dark:text-slate-500" : "text-muted-foreground")}>
                  SOLUTIONS PVT LTD
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <NavLink href="/" label="Home" isLanding={isLanding} />
              <Dropdown label="Products" items={products} isLanding={isLanding} />
              <Dropdown label="Solutions" items={solutions} isLanding={isLanding} />
              <Dropdown label="Learning" items={learning} isLanding={isLanding} />
              <NavLink href="/careers" label="Careers" isLanding={isLanding} />
              <NavLink href="/contact" label="Contact" isLanding={isLanding} />
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/contact#contact-form"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isLanding
                    ? "text-slate-800 ring-1 ring-border hover:bg-slate-50 dark:text-white dark:ring-white/25 dark:hover:bg-white/10"
                    : "text-white bg-gradient-to-r from-[#F57C00] to-[#ff9a3d] shadow-[0_10px_30px_rgba(245,124,0,.22)] hover:shadow-[0_14px_40px_rgba(245,124,0,.28)]"
                )}
              >
                <CalendarCheck className="h-4 w-4" />
                Contact us
              </Link>

              <div className="relative group">
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                    isLanding
                      ? "text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] shadow-[0_10px_28px_rgba(249,115,22,.35)] hover:from-orange-500 hover:to-orange-400"
                      : "text-foreground bg-muted/50 ring-1 ring-border hover:bg-muted"
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                  {isLanding ? (
                    <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
                  ) : (
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  )}
                </Link>
                <div
                  className={cn(
                    "invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute right-0 top-[calc(100%+10px)] w-56 rounded-2xl border p-2 shadow-lg backdrop-blur-xl",
                    isLanding
                      ? "border-border bg-white shadow-lg dark:border-white/10 dark:bg-[#0c1018]/95"
                      : "border-border bg-popover/95"
                  )}
                >
                  <Link
                    href="/login?tab=admin"
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                      isLanding
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Sparkles className="h-4 w-4 text-[#F57C00]" />
                    Admin Login
                  </Link>
                  <Link
                    href="/login?tab=employee"
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                      isLanding
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Sparkles className="h-4 w-4 text-[#F57C00]" />
                    Employee Login
                  </Link>
                  <Link
                    href="/login?tab=onboarding"
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                      isLanding
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Sparkles className="h-4 w-4 text-[#F57C00]" />
                    Onboarding
                  </Link>
                </div>
              </div>
            </div>

            <div className={cn("lg:hidden flex items-center gap-2", isLanding && "text-slate-800 dark:text-white")}>
              <ThemeToggle />
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center h-10 w-10 rounded-xl transition",
                  isLanding
                    ? "bg-white ring-1 ring-border hover:bg-slate-50 dark:bg-white/5 dark:ring-white/15 dark:hover:bg-white/10"
                    : "bg-muted/50 ring-1 ring-border hover:bg-muted"
                )}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen ? (
          <div
            className={cn(
              "lg:hidden border-t",
              isLanding ? "border-border bg-white dark:border-white/10 dark:bg-[#070a12]" : "border-border"
            )}
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-3">
              <Link
                className={cn(
                  "block text-sm",
                  isLanding
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href="/"
                onClick={closeMobile}
              >
                Home
              </Link>
              <Link
                className={cn(
                  "block text-sm",
                  isLanding
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href="/products"
                onClick={closeMobile}
              >
                Products
              </Link>
              <Link
                className={cn(
                  "block text-sm",
                  isLanding
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href="/solutions"
                onClick={closeMobile}
              >
                Solutions
              </Link>
              <Link
                className={cn(
                  "block text-sm",
                  isLanding
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href="/learning"
                onClick={closeMobile}
              >
                Learning
              </Link>
              <Link
                className={cn(
                  "block text-sm",
                  isLanding
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href="/careers"
                onClick={closeMobile}
              >
                Careers
              </Link>
              <Link
                className={cn(
                  "block text-sm",
                  isLanding
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href="/contact"
                onClick={closeMobile}
              >
                Contact
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/contact#contact-form"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                    isLanding
                      ? "text-slate-800 ring-1 ring-border hover:bg-slate-50 dark:text-white dark:ring-white/25 dark:hover:bg-white/10"
                      : "text-white bg-gradient-to-r from-[#F57C00] to-[#ff9a3d]"
                  )}
                  onClick={closeMobile}
                >
                  <CalendarCheck className="h-4 w-4" />
                  Contact us
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                    isLanding
                      ? "text-white bg-gradient-to-r from-[#f97316] to-[#fb923c]"
                      : "text-foreground bg-muted/50 ring-1 ring-border hover:bg-muted"
                  )}
                  onClick={closeMobile}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}

