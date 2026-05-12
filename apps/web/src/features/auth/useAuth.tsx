"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import {
  clearSession,
  setSession,
  type AuthRole,
} from "@/store/slices/authSlice";
import { clearSessionStorage, loadSession, saveSession } from "./session";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((s: RootState) => s.auth);
  const [hydrated, setHydrated] = React.useState(false);

  // hydrate once from localStorage
  React.useEffect(() => {
    if (hydrated) return;
    const s = loadSession();
    if (s) dispatch(setSession(s));
    setHydrated(true);
  }, [dispatch, hydrated]);

  const login = React.useCallback(
    (params: { token: string; role: AuthRole; userId: string }) => {
      saveSession(params);
      dispatch(setSession(params));
    },
    [dispatch]
  );

  const logout = React.useCallback(() => {
    clearSessionStorage();
    dispatch(clearSession());
  }, [dispatch]);

  return { ...auth, hydrated, login, logout };
}

