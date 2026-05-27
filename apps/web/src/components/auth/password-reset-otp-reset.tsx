"use client";

import Link from "next/link";
import Image from "next/image";
import { KeyRound } from "lucide-react";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { marketingPageRoot, marketingSurface, marketingInput } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";

type PasswordResetOtpResetProps = {
  portal: "admin" | "employee";
  apiPath: string;
  forgotHref: string;
  loginHref: string;
  identifierParam: "email" | "identifier";
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierType?: "email" | "text";
};

function ResetForm({
  portal,
  apiPath,
  forgotHref,
  loginHref,
  identifierParam,
  identifierLabel,
  identifierPlaceholder,
  identifierType = "text",
}: PasswordResetOtpResetProps) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get(identifierParam) ?? "";

  const [identifier, setIdentifier] = React.useState(initialId);
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (initialId) setIdentifier(initialId);
  }, [initialId]);

  const onSubmit = async () => {
    setError(null);
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit OTP from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        otp: otp.replace(/\D/g, ""),
        password,
      };
      if (portal === "admin") {
        body.email = identifier.trim().toLowerCase();
      } else {
        body.identifier = identifier.trim();
      }

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        const msg =
          data.error === "invalid_otp"
            ? "Invalid OTP. Check the code or request a new one."
            : data.error === "otp_expired"
              ? "OTP expired. Request a new code."
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
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
              {portal}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Reset password</div>
          </div>
        </div>

        {done ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90">
              Password updated. Sign in with your new password.
            </div>
            <Link
              href={loginHref}
              className="inline-flex text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
            >
              Go to login →
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter the OTP from your email and choose a new password.
            </p>
            <input
              className={marketingInput}
              type={identifierType}
              placeholder={identifierPlaceholder}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete={identifierType === "email" ? "email" : "username"}
            />
            <input
              className={marketingInput}
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
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
              onClick={() => void onSubmit()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white dark:from-[#f97316] dark:to-amber-400"
            >
              <KeyRound className="h-4 w-4" />
              {loading ? "Saving…" : "Reset password"}
            </button>
            {error ? (
              <div className="rounded-xl border border-red-200/80 bg-red-50 p-3 text-sm text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100/90">
                {error}
              </div>
            ) : null}
            <Link
              href={forgotHref}
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
            >
              Request new OTP
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function PasswordResetOtpReset(props: PasswordResetOtpResetProps) {
  return (
    <React.Suspense
      fallback={
        <div
          className={cn(
            marketingPageRoot,
            "grid min-h-screen place-items-center px-4 py-12 text-sm text-slate-500"
          )}
        >
          Loading…
        </div>
      }
    >
      <ResetForm {...props} />
    </React.Suspense>
  );
}
