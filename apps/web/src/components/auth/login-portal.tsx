"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { LoginDashboardContinue } from "@/components/auth/login-dashboard-continue";
import { LoginErrorAlert } from "@/components/auth/login-error-alert";
import { OnboardingDocumentsPanel } from "@/components/auth/onboarding-documents-panel";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { loginErrorMessage } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";

export type LoginTab = "admin" | "employee" | "onboarding";

const tabs: { id: LoginTab; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "employee", label: "Employee" },
  { id: "onboarding", label: "Onboarding" },
];

type LoginPortalProps = {
  initialTab?: LoginTab;
};

export function LoginPortal({ initialTab = "employee" }: LoginPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const tabFromUrl = searchParams.get("tab");
  const resolvedInitial =
    tabFromUrl === "admin" || tabFromUrl === "employee" || tabFromUrl === "onboarding"
      ? tabFromUrl
      : initialTab;

  const [activeTab, setActiveTab] = React.useState<LoginTab>(resolvedInitial);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setActiveTab(resolvedInitial);
  }, [resolvedInitial]);

  const switchTab = (tab: LoginTab) => {
    setActiveTab(tab);
    setError(null);
    setIdentifier("");
    setPassword("");
    router.replace(`/login?tab=${tab}`, { scroll: false });
  };

  const onSubmit = async () => {
    if (activeTab === "onboarding") return;
    setError(null);
    setLoading(true);
    const portal = activeTab;
    const endpoint = portal === "admin" ? "/api/auth/admin/login" : "/api/auth/employee/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        user?: { id: string; role: "admin" | "employee" };
        error?: string;
      };
      if (!res.ok) {
        setError(loginErrorMessage(data.error, portal));
        return;
      }
      const expectedRole = portal;
      if (!data.user?.id || data.user.role !== expectedRole) {
        setError("Login failed. Please try again.");
        return;
      }
      auth.login({ role: data.user.role, userId: data.user.id });
      router.push(portal === "admin" ? "/admin" : "/employee");
    } catch {
      setError("Can't reach the sign-in service. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = activeTab === "admin";
  const isEmployee = activeTab === "employee";
  const isOnboarding = activeTab === "onboarding";

  return (
    <div className={cn(marketingPageRoot, "relative grid min-h-screen place-items-center px-4 py-12")}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15,23,42,0.09) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className={cn(
          marketingSurface,
          "relative w-full p-7 shadow-lg shadow-slate-900/5 dark:shadow-[0_40px_120px_rgba(0,0,0,.45)]",
          isOnboarding ? "max-w-2xl" : "max-w-md"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-border bg-muted/60 dark:bg-white/5 dark:ring-1 dark:ring-white/10">
            <Image src="/brand/shivtatva-logo.png" alt="Shiv Tatva" fill className="object-contain p-1" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Shiv Tatva HRMS</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Sign in</div>
          </div>
        </div>

        <div
          className="mt-6 flex rounded-xl border border-border/80 bg-slate-50/80 p-1 dark:border-white/10 dark:bg-white/[0.04]"
          role="tablist"
          aria-label="Login portal"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => switchTab(t.id)}
              className={cn(
                "flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:text-sm",
                activeTab === t.id
                  ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isOnboarding ? (
          <OnboardingDocumentsPanel onGoToEmployeeLogin={() => switchTab("employee")} />
        ) : (
          <div className="mt-6 grid gap-3" role="tabpanel">
            {isEmployee ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#ea580c] dark:text-[#f97316]" aria-hidden />
                <span>Attendance • Leave • Payslips • Tasks</span>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage employees, attendance, leave, payroll, and settings.
              </p>
            )}

            <label className="sr-only" htmlFor="login-identifier">
              {isAdmin ? "Admin email" : "Employee ID or email"}
            </label>
            <input
              id="login-identifier"
              className={marketingInput}
              placeholder={isAdmin ? "Admin email" : "Employee ID / Email"}
              type={isAdmin ? "email" : "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <label className="sr-only" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className={marketingInput}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
            />
            <div className="flex justify-end">
              <Link
                href={isAdmin ? "/login/admin/forgot" : "/login/employee/forgot"}
                className="text-xs font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
            >
              <Lock className="h-4 w-4" />
              {loading ? "Signing in..." : isAdmin ? "Admin login" : "Employee login"}
            </button>
            <LoginErrorAlert message={error} showNetworkHint={false} />
            <LoginDashboardContinue portal={isAdmin ? "admin" : "employee"} />
          </div>
        )}

        <Link
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </Link>
      </div>
    </div>
  );
}
