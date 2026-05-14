"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";
import { EMPLOYEE_ID_DEFAULT } from "@/lib/employee-auth-constants";

export default function EmployeeForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState(EMPLOYEE_ID_DEFAULT);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [devOtp, setDevOtp] = React.useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevOtp(null);
    try {
      const res = await fetch("/api/auth/employee/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        resetPath?: string;
        devOtp?: string;
        error?: string;
        hint?: string;
        detail?: string;
      };
      if (!res.ok) {
        const hint = data.hint ? ` ${data.hint}` : "";
        setError(
          data.error === "not_configured"
            ? `Server not configured.${hint || " Set SUPABASE_SERVICE_ROLE_KEY on Vercel."}`
            : data.error === "email_not_configured"
              ? `Email not configured.${hint || " Add RESEND_API_KEY on Vercel and redeploy."}`
              : data.error === "email_send_failed" || data.error === "resend_domain_required"
                ? data.error === "resend_domain_required"
                  ? data.detail ??
                    "Resend requires a verified domain to email employees. Set RESEND_TEST_INBOX=ganeshbandaru800@gmail.com on Vercel for testing."
                  : `Could not send email.${hint || ""}${data.detail ? ` (${data.detail})` : ""}`
                : data.error === "service_unavailable"
                  ? "Can't reach Supabase. Try again in a moment."
                  : data.error === "save_failed"
                    ? data.hint ?? "Could not save OTP. Run supabase/employee_users.sql in Supabase."
                    : data.detail
                      ? `Request failed: ${data.detail}`
                      : `Request failed.${hint}`
        );
        return;
      }
      setMessage(data.message ?? "If that employee account exists, a 6-digit code has been sent to your email.");
      if (data.devOtp) setDevOtp(data.devOtp);
      if (data.resetPath && !data.devOtp) {
        setTimeout(() => router.push(data.resetPath!), 1500);
      }
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
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Forgot password</div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Enter your employee ID or work email. We will send a 6-digit OTP to your registered email (valid 15
          minutes).
        </p>

        <div className="mt-5 grid gap-3">
          <input
            className={marketingInput}
            placeholder="Employee ID / Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !identifier.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
          >
            <Mail className="h-4 w-4" />
            {loading ? "Sending OTP…" : "Send OTP to email"}
          </button>
          {message ? (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90">
              {message}
              {devOtp ? <p className="mt-2 font-mono font-semibold">Dev OTP: {devOtp}</p> : null}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-red-200/80 bg-red-50 p-3 text-sm text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100/90">
              {error}
            </div>
          ) : null}
          <Link
            href="/login/employee"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to employee login
          </Link>
        </div>
      </div>
    </div>
  );
}
