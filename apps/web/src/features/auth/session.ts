"use client";

import type { AuthRole } from "@/store/slices/authSlice";

const KEY = "shivtatva.session.v1";

export type PersistedSession = {
  token: string;
  role: AuthRole;
  userId: string;
};

export function loadSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: PersistedSession) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSessionStorage() {
  window.localStorage.removeItem(KEY);
}

