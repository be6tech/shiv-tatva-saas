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
    }>("/attendance/today", { token: auth.token })
      .then((r) => {
        setApiDay(r.day);
        setApiShift(r.shift ?? null);
        setApiAllowed(r.allowed ?? null);
        setApiStatus(r.status ?? null);
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
      apiFetch<{ day: AttendanceDay }>("/attendance/event", {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({ type }),
      })
        .then((r: { day: AttendanceDay; allowed?: AttendanceEventType[]; status?: string }) => {
          setApiDay(r.day);
          setApiAllowed(r.allowed ?? null);
          setApiStatus(r.status ?? null);
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
    apiFetch<{ day: AttendanceDay; allowed?: AttendanceEventType[]; status?: string }>(
      `/attendance/event?override=true`,
      {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({ type }),
      }
    )
      .then((r) => {
        setApiDay(r.day);
        setApiAllowed(r.allowed ?? null);
        setApiStatus(r.status ?? null);
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

  const resetToday = () => {
    if (useApi) {
      apiFetch<{ ok: boolean }>("/attendance/reset", {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({}),
      })
        .then(() => {
          setApiDay(null);
          setApiAllowed(null);
          setApiStatus(null);
          setApiError(null);
          setApiErrorCode(null);
        })
        .catch(() => {});
      return;
    }
    setStore((prev) => {
      const next = { ...prev };
      delete next[key];
      saveStore(next);
      return next;
    });
  };

  return {
    day,
    allowed,
    addEvent,
    addEventOverride,
    resetToday,
    dateKey,
    source: useApi ? ("api" as const) : ("local" as const),
    shift: useApi ? apiShift : null,
    status: useApi ? apiStatus : null,
    apiError,
    apiErrorCode,
  };
}

