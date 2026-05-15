"use client";

import type { AuthRole } from "@/store/slices/authSlice";

const KEY = "shivtatva.session.v1";

/** @deprecated Legacy browser storage; new logins use httpOnly cookies only. */
export type PersistedSession = {
  token: string;
  role: AuthRole;
  userId: string;
};

/** Read legacy session (pre-cookie migration). */
export function loadSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

export function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
