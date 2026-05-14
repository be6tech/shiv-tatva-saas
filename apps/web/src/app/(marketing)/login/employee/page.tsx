"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Lock, ArrowLeft } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { LoginDashboardContinue } from "@/components/auth/login-dashboard-continue";
import { LoginErrorAlert } from "@/components/auth/login-error-alert";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";
import { EMPLOYEE_ID_DEFAULT } from "@/lib/employee-auth-constants";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [identifier, setIdentifier] = React.useState(EMPLOYEE_ID_DEFAULT);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        token?: string;
        user?: { id: string; role: "employee" };
        error?: string;
      };
      if (!res.ok) {
        setError(
          data.error === "invalid_credentials"
            ? "Invalid employee ID/email or password."
            : data.error === "not_configured"
              ? "Sign-in is not configured. Set SUPABASE_SERVICE_ROLE_KEY and run supabase/employee_users.sql."
              : data.error === "service_unavailable"
                ? "Can't reach Supabase. In local dev use your Employee ID / email with password demo."
                : "Login failed. Please try again."
        );
        return;
      }
      if (!data.token || !data.user) {
        setError("Login failed. Please try again.");
        return;
      }
      auth.login({ token: data.token, role: data.user.role, userId: data.user.id });
      router.push("/employee");
    } catch {
      setError("Can't reach the sign-in service. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(marketingPageRoot, "relative grid min-h-screen place-items-center px-4 py-12")}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15,23,42,0.09) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className={cn(
          marketingSurface,
          "relative w-full max-w-md p-7 shadow-lg shadow-slate-900/5 dark:shadow-[0_40px_120px_rgba(0,0,0,.45)]"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-border bg-muted/60 dark:bg-white/5 dark:ring-1 dark:ring-white/10">
            <Image src="/brand/shivtatva-logo.png" alt="Shiv Tatva" fill className="object-contain p-1" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Login</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Self-service Portal</div>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#ea580c] dark:text-[#f97316]" aria-hidden />
          <span>Attendance • Leave • Payslips • Tasks</span>
        </div>

        <div className="mt-6 grid gap-3">
          <label className="sr-only" htmlFor="employee-login-id">
            Employee ID or email
          </label>
          <input
            id="employee-login-id"
            className={marketingInput}
            placeholder="Employee ID / Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <label className="sr-only" htmlFor="employee-login-password">
            Password
          </label>
          <input
            id="employee-login-password"
            className={marketingInput}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSubmit();
            }}
          />
          <div className="flex justify-end">
            <Link
              href="/login/employee/forgot"
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
            {loading ? "Signing in..." : "Login"}
          </button>
          <LoginErrorAlert message={error} showNetworkHint={false} />
          <LoginDashboardContinue portal="employee" />
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
