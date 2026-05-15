"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import {
  clearSession,
  setSession,
  type AuthRole,
} from "@/store/slices/authSlice";
import { COOKIE_SESSION_MARKER } from "@/lib/auth-client";
import { clearSessionStorage, loadSession } from "./session";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((s: RootState) => s.auth);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (hydrated) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            authenticated?: boolean;
            user?: { id: string; role: AuthRole };
          };
          if (data.authenticated && data.user?.id && data.user?.role) {
            if (!cancelled) {
              clearSessionStorage();
              dispatch(
                setSession({
                  token: COOKIE_SESSION_MARKER,
                  role: data.user.role,
                  userId: data.user.id,
                })
              );
            }
            return;
          }
        }
      } catch {
        // fall through to legacy localStorage
      }

      const legacy = loadSession();
      if (legacy?.token && legacy.token !== COOKIE_SESSION_MARKER && !cancelled) {
        dispatch(setSession(legacy));
      }
    })().finally(() => {
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, hydrated]);

  const login = React.useCallback(
    (params: { role: AuthRole; userId: string }) => {
      clearSessionStorage();
      dispatch(
        setSession({
          token: COOKIE_SESSION_MARKER,
          role: params.role,
          userId: params.userId,
        })
      );
    },
    [dispatch]
  );

  const logout = React.useCallback(() => {
    void fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    clearSessionStorage();
    dispatch(clearSession());
  }, [dispatch]);

  const isAuthenticated = Boolean(auth.role && auth.userId);

  return { ...auth, hydrated, isAuthenticated, login, logout };
}
