"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Wallet,
  BarChart3,
  Bell,
  Settings,
  ClipboardList,
  LogOut,
  Inbox,
  ArrowLeft,
  LogIn,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/features/auth/useAuth";
import { apiFetch } from "@/lib/api";

type Role = "admin" | "employee";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarClock },
  { href: "/admin/leave", label: "Leave Management", icon: ClipboardList },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/payroll", label: "Payroll", icon: Wallet },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const employeeNav = [
  { href: "/employee", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/attendance", label: "Attendance", icon: CalendarClock },
  { href: "/employee/leave", label: "Leave Requests", icon: ClipboardList },
  { href: "/employee/payslips", label: "Payslips", icon: Wallet },
  { href: "/employee/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/employee/notifications", label: "Notifications", icon: Bell },
  { href: "/employee/settings", label: "Profile", icon: Settings },
];

function Sidebar({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const auth = useAuth();
  const items = role === "admin" ? adminNav : employeeNav;
  const [unread, setUnread] = React.useState(0);
  const [newLeads, setNewLeads] = React.useState(0);

  React.useEffect(() => {
    if (!auth.hydrated || !auth.token) return;
    let cancelled = false;

    const load = () => {
      const unreadReq = apiFetch<{ items: any[] }>("/notifications?unreadOnly=true&limit=200", {
        token: auth.token,
      }).then((r) => (r.items ?? []).length);

      const leadsReq =
        role === "admin"
          ? apiFetch<{ leads: any[] }>("/admin/leads", { token: auth.token }).then(
              (r) => (r.leads ?? []).filter((l) => (l.status ?? "New") === "New").length
            )
          : Promise.resolve(0);

      Promise.all([unreadReq, leadsReq])
        .then(([u, nl]) => {
          if (cancelled) return;
          setUnread(u);
          setNewLeads(nl);
        })
        .catch(() => {
          if (cancelled) return;
          setUnread(0);
          setNewLeads(0);
        });
    };

    load();
    const t = window.setInterval(load, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [auth.hydrated, auth.token, role]);

  const homeHref = role === "admin" ? "/admin" : "/employee";

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card/50">
      <div className="p-5 border-b border-border">
        <Link href={homeHref} className="flex items-center gap-3" aria-label="Go to dashboard">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1 ring-border bg-muted/40">
            <Image src="/brand/shivtatva-logo.png" alt="Shiv Tatva" fill className="object-contain p-1" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">Shiv Tatva</div>
            <div className="text-[11px] text-muted-foreground">
              {role === "admin" ? "Admin Console" : "Employee Portal"}
            </div>
          </div>
        </Link>
      </div>

      <nav className="p-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          const badge =
            it.href === (role === "admin" ? "/admin/notifications" : "/employee/notifications")
              ? unread
              : role === "admin" && it.href === "/admin/leads"
                ? newLeads
                : 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ring-1 ring-transparent",
                active
                  ? "bg-muted ring-border text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <it.icon className="h-4 w-4 text-[#F57C00]" />
              <span className="flex-1">{it.label}</span>
              {badge > 0 ? (
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-[11px] font-semibold bg-[#F57C00]/15 text-[#ffb26b] ring-1 ring-[#F57C00]/25">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-border p-4">
        {role === "admin" ? (
          <Link
            href="/login/admin"
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground ring-1 ring-border bg-background/50 hover:bg-muted hover:text-foreground transition"
          >
            <LogIn className="h-4 w-4 text-[#F57C00]" aria-hidden />
            Back to login page
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-foreground bg-muted/50 ring-1 ring-border hover:bg-muted transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function DashboardShell({
  role,
  title,
  children,
}: Readonly<{
  role: Role;
  title: string;
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const homeHref = role === "admin" ? "/admin" : "/employee";
  const showBackToDashboard = pathname !== homeHref;
  const showAdminTopBar = role === "admin" && (showBackToDashboard || pathname === homeHref);
  const showEmployeeTopBar = role === "employee" && showBackToDashboard;
  const showTopBackBar = showAdminTopBar || showEmployeeTopBar;

  React.useEffect(() => {
    if (!auth.hydrated) return;
    if (auth.token === null) {
      router.replace(role === "admin" ? "/login/admin" : "/login/employee");
      return;
    }
    if (auth.role && auth.role !== role) {
      router.replace(auth.role === "admin" ? "/admin" : "/employee");
    }
  }, [auth.hydrated, auth.token, auth.role, role, router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar
          role={role}
          onLogout={() => {
            auth.logout();
            router.replace(role === "admin" ? "/login/admin" : "/login/employee");
          }}
        />
        <div className="flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
            {showTopBackBar ? (
              <div className="border-b border-border bg-muted/50 dark:bg-muted/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5">
                  {role === "admin" ? (
                    <div className="flex min-h-11 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                      {showBackToDashboard ? (
                        <Link
                          href={homeHref}
                          className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-[#F57C00]"
                        >
                          <ArrowLeft className="h-4 w-4 shrink-0 text-[#F57C00]" aria-hidden />
                          <span>Back to dashboard</span>
                        </Link>
                      ) : null}
                      <Link
                        href="/login/admin"
                        className={cn(
                          "inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-[#F57C00] sm:shrink-0",
                          showBackToDashboard && "sm:ml-auto"
                        )}
                      >
                        <LogIn className="h-4 w-4 shrink-0 text-[#F57C00]" aria-hidden />
                        <span>Back to login page</span>
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={homeHref}
                      className="flex min-h-11 w-full max-w-full items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-[#F57C00] sm:inline-flex sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0 text-[#F57C00]" aria-hidden />
                      <span>Back to dashboard</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
            <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-muted-foreground">{role === "admin" ? "Admin" : "Employee"}</div>
                <div className="text-lg font-semibold text-foreground truncate">{title}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

