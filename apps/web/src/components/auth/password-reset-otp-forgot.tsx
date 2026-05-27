"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, KeyRound } from "lucide-react";
import * as React from "react";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";

type PasswordResetOtpForgotProps = {
  portal: "admin" | "employee";
  apiPath: string;
  backHref: string;
  resetBasePath: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierType?: "email" | "text";
};

export function PasswordResetOtpForgot({
  portal,
  apiPath,
  backHref,
  resetBasePath,
  identifierLabel,
  identifierPlaceholder,
  identifierType = "text",
}: PasswordResetOtpForgotProps) {
  const [identifier, setIdentifier] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [devOtp, setDevOtp] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const canSubmit =
    identifierType === "email" ? identifier.trim().includes("@") : identifier.trim().length >= 3;

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevOtp(null);
    setSentTo(null);
    try {
      const body =
        portal === "admin"
          ? { email: identifier.trim().toLowerCase() }
          : { identifier: identifier.trim() };
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
        hint?: string;
        devOtp?: string;
        maskedEmail?: string;
      };
      if (!res.ok) {
        setError(
          data.error === "not_configured"
            ? `Server not configured.${data.hint ? ` ${data.hint}` : ""}`
            : data.error === "email_failed"
              ? data.hint ?? "Could not send OTP email. Configure Resend or Google Apps Script in .env.local."
              : data.error === "save_failed"
                ? data.hint ?? "Could not send OTP."
                : "Request failed."
        );
        return;
      }
      setMessage(data.message ?? "If an account exists, a code was sent to the registered email.");
      if (data.maskedEmail) setSentTo(data.maskedEmail);
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch {
      setError("Can't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetHref = `${resetBasePath}?${portal === "admin" ? "email" : "identifier"}=${encodeURIComponent(identifier.trim())}`;

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
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
              {portal}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Forgot password</div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Enter your {identifierLabel.toLowerCase()}. We&apos;ll email a 6-digit OTP valid for 10 minutes.
        </p>

        <div className="mt-5 grid gap-3">
          <label className="sr-only" htmlFor="forgot-identifier">
            {identifierLabel}
          </label>
          <input
            id="forgot-identifier"
            className={marketingInput}
            type={identifierType}
            placeholder={identifierPlaceholder}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete={identifierType === "email" ? "email" : "username"}
          />
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={loading || !canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
          {message ? (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90">
              {message}
              {sentTo ? <p className="mt-1 text-xs opacity-90">Sent to {sentTo}</p> : null}
              {devOtp ? (
                <p className="mt-2 font-mono text-xs font-semibold">Dev OTP: {devOtp}</p>
              ) : null}
              <Link
                href={resetHref}
                className="mt-2 block font-medium text-[#ea580c] underline dark:text-[#f97316]"
              >
                Enter OTP & reset password →
              </Link>
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-red-200/80 bg-red-50 p-3 text-sm text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100/90">
              {error}
            </div>
          ) : null}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
