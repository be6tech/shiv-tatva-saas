"use client";

import Link from "next/link";
import Image from "next/image";
import { KeyRound } from "lucide-react";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";
import { EMPLOYEE_ID_DEFAULT } from "@/lib/employee-auth-constants";

function EmployeeResetPasswordForm() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = React.useState(
    searchParams.get("identifier") ?? EMPLOYEE_ID_DEFAULT
  );
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const onSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!identifier.trim() || otp.trim().length < 6) {
      setError("Enter your employee ID/email and the 6-digit OTP from your inbox.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/employee/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp: otp.trim(), password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        const msg =
          data.error === "invalid_otp"
            ? "Invalid OTP. Check the code from your email."
            : data.error === "otp_expired"
              ? "OTP expired. Request a new one."
              : data.error === "not_configured"
                ? "Password reset is not configured on the server."
                : "Could not reset password. Try again.";
        setError(msg);
        return;
      }
      setDone(true);
    } catch {
      setError("Can't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(marketingPageRoot, "relative grid min-h-screen place-items-center px-4 py-12")}>
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
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Reset with OTP</div>
          </div>
        </div>

        {done ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90">
              Password updated. You can sign in with your new password.
            </div>
            <Link
              href="/login/employee"
              className="inline-flex text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
            >
              Go to employee login →
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter the 6-digit OTP sent to your registered email and choose a new password.
            </p>
            <input
              className={marketingInput}
              placeholder="Employee ID / Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className={marketingInput}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <input
              className={marketingInput}
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className={marketingInput}
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
            >
              <KeyRound className="h-4 w-4" />
              {loading ? "Saving…" : "Update password"}
            </button>
            {error ? (
              <div className="rounded-xl border border-red-200/80 bg-red-50 p-3 text-sm text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100/90">
                {error}
              </div>
            ) : null}
            <Link
              href="/login/employee/forgot"
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
            >
              Resend OTP
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className={cn(marketingPageRoot, "grid min-h-screen place-items-center px-4 py-12 text-sm text-slate-500")}>
          Loading…
        </div>
      }
    >
      <EmployeeResetPasswordForm />
    </React.Suspense>
  );
}
