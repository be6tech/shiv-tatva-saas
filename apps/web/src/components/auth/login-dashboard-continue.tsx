"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import type { AuthRole } from "@/store/slices/authSlice";

const linkClass =
  "text-sm font-medium text-foreground underline-offset-4 hover:text-[#F57C00] hover:underline";

export function LoginDashboardContinue({ portal }: { portal: AuthRole }) {
  const auth = useAuth();
  const target = portal === "admin" ? "/admin" : "/employee";
  const continueLabel =
    portal === "admin" ? "Continue to Admin Dashboard →" : "Continue to Employee Dashboard →";

  if (!auth.hydrated) return null;

  if (!auth.role) return null;

  if (auth.role === portal) {
    return (
      <Link className={linkClass} href={target}>
        {continueLabel}
      </Link>
    );
  }

  const otherLabel = auth.role === "admin" ? "administrator" : "employee";
  const otherHref = auth.role === "admin" ? "/admin" : "/employee";

  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      You&apos;re signed in as an {otherLabel}.{" "}
      <Link className={linkClass} href={otherHref}>
        Go to {auth.role === "admin" ? "Admin" : "Employee"} dashboard
      </Link>
      {" · "}
      <button
        type="button"
        onClick={() => auth.logout()}
        className="font-medium text-foreground underline-offset-4 hover:text-[#F57C00] hover:underline"
      >
        Sign out
      </button>
      {" "}
      to use {portal} login here.
    </p>
  );
}
