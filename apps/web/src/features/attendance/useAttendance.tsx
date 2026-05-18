"use client";

import * as React from "react";
import { formatDateKey } from "@/lib/time";
import type { AttendanceDay, AttendanceEventType } from "./types";
import { nextAllowed } from "./logic";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";

const STORAGE_KEY = "shivtatva.attendance.v1";

type ShiftInfo = {
  id: string;
  name: string;
  start: string;
  end: string;
};

export type AttendanceMetrics = {
  workHoursPerDay?: number;
  netWorkMinutes?: number;
  lunchMinutes?: number;
  breakMinutes?: number;
  workTargetMinutes?: number;
  remainingWorkMinutes?: number;
  expectedCheckOutAt?: string | null;
  checkInAt?: string | null;
};

type StoreShape = Record<string, AttendanceDay>; // `${dateKey}:${employeeId}`

function loadStore(): StoreShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoreShape) : {};
  } catch {
    return {};
  }
}

function saveStore(store: StoreShape) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useAttendance(params: {
  employeeId: string;
  employeeName: string;
  department: string;
}) {
  const { employeeId, employeeName, department } = params;
  const dateKey = formatDateKey(new Date());
  const key = `${dateKey}:${employeeId}`;
  const auth = useAuth();

  const [store, setStore] = React.useState<StoreShape>(() => loadStore());
  const [apiDay, setApiDay] = React.useState<AttendanceDay | null>(null);
  const [apiShift, setApiShift] = React.useState<ShiftInfo | null>(null);
  const [apiAllowed, setApiAllowed] = React.useState<AttendanceEventType[] | null>(
    null
  );
  const [apiStatus, setApiStatus] = React.useState<string | null>(null);
  const [apiMetrics, setApiMetrics] = React.useState<AttendanceMetrics | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [apiErrorCode, setApiErrorCode] = React.useState<string | null>(null);
  const useApi = auth.hydrated && !!auth.token;

  const day = useApi ? apiDay : store[key] ?? null;
  const allowed = useApi ? apiAllowed ?? nextAllowed(day) : nextAllowed(day);

  React.useEffect(() => {
    if (!useApi) return;
    apiFetch<{
      day: AttendanceDay | null;
      shift?: ShiftInfo;
      allowed?: AttendanceEventType[];
      status?: string;
      metrics?: AttendanceMetrics;
    }>("/attendance/today", { token: auth.token })
      .then((r) => {
        setApiDay(r.day);
        setApiShift(r.shift ?? null);
        setApiAllowed(r.allowed ?? null);
        setApiStatus(r.status ?? null);
        setApiMetrics(r.metrics ?? null);
        setApiError(null);
      })
      .catch(() => {
        setApiDay(null);
        setApiShift(null);
        setApiAllowed(null);
        setApiStatus(null);
      });
  }, [useApi, auth.token]);

  const addEvent = (type: AttendanceEventType) => {
    if (useApi) {
      setApiError(null);
      apiFetch<{ day: AttendanceDay; metrics?: AttendanceMetrics }>("/attendance/event", {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({ type }),
      })
        .then(
          (r: {
            day: AttendanceDay;
            allowed?: AttendanceEventType[];
            status?: string;
            metrics?: AttendanceMetrics;
          }) => {
          setApiDay(r.day);
          setApiAllowed(r.allowed ?? null);
          setApiStatus(r.status ?? null);
          setApiMetrics(r.metrics ?? null);
          setApiErrorCode(null);
        })
        .catch((e) => {
          if (e instanceof ApiError) {
            const data = e.data as { error?: string; hint?: string } | null;
            const code = data?.error ? String(data.error) : null;
            setApiErrorCode(code);
            if (code === "gateway_required" || code === "gateway_unreachable") {
              setApiError(
                data?.hint ??
                  "Cannot reach the HRMS server. Set API_GATEWAY_URL on Vercel and ensure Render is running."
              );
              return;
            }
            if (code === "invalid_token") {
              setApiError(
                data?.hint ??
                  "Session token rejected by HRMS API. Set the same JWT_SECRET on Vercel and Render, then log out and log in again."
              );
              return;
            }
          }
          setApiError(e instanceof Error ? e.message : "Attendance update failed");
        });
      return;
    }
    setStore((prev) => {
      const existing = prev[key];
      const base: AttendanceDay =
        existing ??
        ({
          dateKey,
          employeeId,
          employeeName,
          department,
          events: [],
        } satisfies AttendanceDay);

      const next = {
        ...prev,
        [key]: {
          ...base,
          events: [...base.events, { type, at: new Date().toISOString() }],
        },
      };
      saveStore(next);
      return next;
    });
  };

  const addEventOverride = (type: AttendanceEventType) => {
    if (!useApi) return;
    setApiError(null);
    apiFetch<{
      day: AttendanceDay;
      allowed?: AttendanceEventType[];
      status?: string;
      metrics?: AttendanceMetrics;
    }>(`/attendance/event?override=true`, {
      method: "POST",
      token: auth.token,
      body: JSON.stringify({ type }),
    })
      .then((r) => {
        setApiDay(r.day);
        setApiAllowed(r.allowed ?? null);
        setApiStatus(r.status ?? null);
        setApiMetrics(r.metrics ?? null);
        setApiErrorCode(null);
      })
      .catch((e) => {
        if (e instanceof ApiError) {
          const code =
            typeof e.data === "object" && e.data && "error" in (e.data as any)
              ? String((e.data as any).error)
              : null;
          setApiErrorCode(code);
        }
        setApiError(e instanceof Error ? e.message : "Override failed");
      });
  };

  const applyDayUpdate = (r: {
    day: AttendanceDay | null;
    allowed?: AttendanceEventType[];
    status?: string;
  }) => {
    setApiDay(r.day);
    setApiAllowed(r.allowed ?? null);
    setApiStatus(r.status ?? null);
    setApiError(null);
    setApiErrorCode(null);
  };

  const undoLastEvent = () => {
    if (useApi) {
      setApiError(null);
      apiFetch<{
        day: AttendanceDay | null;
        allowed?: AttendanceEventType[];
        status?: string;
      }>("/attendance/undo-last", {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({}),
      })
        .then(applyDayUpdate)
        .catch((e) => {
          setApiError(e instanceof Error ? e.message : "Could not undo last action");
        });
      return;
    }
    setStore((prev) => {
      const existing = prev[key];
      if (!existing?.events.length) return prev;
      const events = existing.events.slice(0, -1);
      if (events.length === 0) {
        const next = { ...prev };
        delete next[key];
        saveStore(next);
        return next;
      }
      const next = {
        ...prev,
        [key]: { ...existing, events },
      };
      saveStore(next);
      return next;
    });
  };

  const removeEventAt = (index: number) => {
    if (useApi) {
      setApiError(null);
      apiFetch<{
        day: AttendanceDay | null;
        allowed?: AttendanceEventType[];
        status?: string;
      }>("/attendance/remove-event", {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({ index }),
      })
        .then(applyDayUpdate)
        .catch((e) => {
          setApiError(e instanceof Error ? e.message : "Could not remove event");
        });
      return;
    }
    setStore((prev) => {
      const existing = prev[key];
      if (!existing?.events.length) return prev;
      const events = existing.events.filter((_, i) => i !== index);
      if (events.length === 0) {
        const next = { ...prev };
        delete next[key];
        saveStore(next);
        return next;
      }
      const next = {
        ...prev,
        [key]: { ...existing, events },
      };
      saveStore(next);
      return next;
    });
  };

  const refreshToday = () => {
    if (!useApi) return;
    apiFetch<{
      day: AttendanceDay | null;
      shift?: ShiftInfo;
      allowed?: AttendanceEventType[];
      status?: string;
      metrics?: AttendanceMetrics;
    }>("/attendance/today", { token: auth.token })
      .then((r) => {
        setApiDay(r.day);
        setApiShift(r.shift ?? null);
        setApiAllowed(r.allowed ?? null);
        setApiStatus(r.status ?? null);
        setApiMetrics(r.metrics ?? null);
      })
      .catch(() => {});
  };

  return {
    day,
    allowed,
    addEvent,
    addEventOverride,
    undoLastEvent,
    removeEventAt,
    refreshToday,
    dateKey,
    source: useApi ? ("api" as const) : ("local" as const),
    shift: useApi ? apiShift : null,
    status: useApi ? apiStatus : null,
    metrics: useApi ? apiMetrics : null,
    apiError,
    apiErrorCode,
  };
}

