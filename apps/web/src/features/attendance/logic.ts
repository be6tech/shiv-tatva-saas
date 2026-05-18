import type { AttendanceDay, AttendanceEventType, AttendanceStatus } from "./types";

export function nextAllowed(day: AttendanceDay | null): AttendanceEventType[] {
  if (!day || day.events.length === 0) return ["CHECK_IN"];
  const last = day.events[day.events.length - 1]?.type;

  switch (last) {
    case "CHECK_IN":
      return ["LUNCH_IN", "BREAK_IN", "CHECK_OUT"];
    case "LUNCH_IN":
      return ["LUNCH_OUT"];
    case "LUNCH_OUT":
      return ["BREAK_IN", "CHECK_OUT"];
    case "BREAK_IN":
      return ["BREAK_OUT"];
    case "BREAK_OUT":
      return ["LUNCH_IN", "BREAK_IN", "CHECK_OUT"];
    case "CHECK_OUT":
      return [];
    default:
      return ["CHECK_IN"];
  }
}

export function statusFromEvents(events: AttendanceDay["events"]): AttendanceStatus {
  if (!events.length) return "Offline";
  const last = events[events.length - 1]?.type;
  if (last === "CHECK_OUT") return "Checked Out";
  if (last === "LUNCH_IN") return "On Lunch";
  if (last === "BREAK_IN") return "On Break";
  return "Working";
}

function sumPairMs(
  events: AttendanceDay["events"],
  startType: AttendanceEventType,
  endType: AttendanceEventType,
  nowMs: number
) {
  const toMs = (iso: string) => new Date(iso).getTime();
  const starts = events.filter((e) => e.type === startType).map((e) => toMs(e.at));
  const ends = events.filter((e) => e.type === endType).map((e) => toMs(e.at));
  let acc = 0;
  const paired = Math.min(starts.length, ends.length);
  for (let i = 0; i < paired; i++) acc += Math.max(0, ends[i] - starts[i]);
  if (starts.length > ends.length) {
    acc += Math.max(0, nowMs - starts[starts.length - 1]);
  }
  return acc;
}

export const DEFAULT_WORK_HOURS_PER_DAY = 9;

function toMs(iso: string) {
  return new Date(iso).getTime();
}

export function computeDurations(
  events: AttendanceDay["events"],
  now: Date = new Date(),
  workHoursPerDay = DEFAULT_WORK_HOURS_PER_DAY
) {
  const nowMs = now.getTime();
  const lunchMs = sumPairMs(events, "LUNCH_IN", "LUNCH_OUT", nowMs);
  const breakMs = sumPairMs(events, "BREAK_IN", "BREAK_OUT", nowMs);

  const checkIn = events.find((e) => e.type === "CHECK_IN")?.at;
  const checkOut = [...events].reverse().find((e) => e.type === "CHECK_OUT")?.at;
  const sessionMs =
    checkIn ? Math.max(0, (checkOut ? toMs(checkOut) : nowMs) - toMs(checkIn)) : 0;
  const netWorkMs = Math.max(0, sessionMs - lunchMs - breakMs);
  const workTargetMs = workHoursPerDay * 60 * 60 * 1000;
  const remainingWorkMs = Math.max(0, workTargetMs - netWorkMs);
  const expectedCheckOutAt =
    checkIn && !checkOut
      ? new Date(toMs(checkIn) + workTargetMs + lunchMs + breakMs).toISOString()
      : null;

  return {
    sessionMs,
    netWorkMs,
    lunchMs,
    breakMs,
    workTargetMs,
    remainingWorkMs,
    expectedCheckOutAt,
    workHoursPerDay,
  };
}

export function msToHhMm(ms: number) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

