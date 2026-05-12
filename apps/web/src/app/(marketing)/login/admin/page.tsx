"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, LoginNetworkError } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { LoginDashboardContinue } from "@/components/auth/login-dashboard-continue";
import { LoginErrorAlert } from "@/components/auth/login-error-alert";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [identifier, setIdentifier] = React.useState("admin@shivtatva.com");
  const [password, setPassword] = React.useState("demo");
  const [error, setError] = React.useState<string | null>(null);
  const [networkHint, setNetworkHint] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setError(null);
    setNetworkHint(false);
    setLoading(true);
    try {
      const res = await apiLogin({
        type: "admin",
        identifier,
        password,
      });
      auth.login({ token: res.token, role: res.user.role, userId: res.user.id });
      router.push("/admin");
    } catch (e) {
      if (e instanceof LoginNetworkError) {
        setError(e.message);
        setNetworkHint(true);
      } else {
        setError(e instanceof Error ? e.message : "Login failed");
        setNetworkHint(false);
      }
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
        className="pointer-events-none absolute inset-0 hidden opacity-[0.35] dark:block"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(249,115,22,.35), transparent 55%), radial-gradient(circle at 70% 40%, rgba(59,130,246,.2), transparent 60%)",
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
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Admin Login</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Shiv Tatva HRMS</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <label className="sr-only" htmlFor="admin-login-email">
            Admin email
          </label>
          <input
            id="admin-login-email"
            className={marketingInput}
            placeholder="Admin email"
            type="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <label className="sr-only" htmlFor="admin-login-password">
            Password
          </label>
          <input
            id="admin-login-password"
            className={marketingInput}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Signing in..." : "Login"}
          </button>
          <LoginErrorAlert message={error} showNetworkHint={networkHint} />
          <LoginDashboardContinue portal="admin" />
          <Link
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
            href="/"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

