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

export function computeDurations(events: AttendanceDay["events"]) {
  const toMs = (iso: string) => new Date(iso).getTime();
  let lunchMs = 0;
  let breakMs = 0;

  const pairs: Array<[AttendanceEventType, AttendanceEventType, "work" | "lunch" | "break"]> = [
    ["CHECK_IN", "CHECK_OUT", "work"],
    ["LUNCH_IN", "LUNCH_OUT", "lunch"],
    ["BREAK_IN", "BREAK_OUT", "break"],
  ];

  for (const [startType, endType, bucket] of pairs) {
    const starts = events.filter((e) => e.type === startType).map((e) => toMs(e.at));
    const ends = events.filter((e) => e.type === endType).map((e) => toMs(e.at));
    const len = Math.min(starts.length, ends.length);
    for (let i = 0; i < len; i++) {
      const delta = Math.max(0, ends[i] - starts[i]);
      if (bucket === "lunch") lunchMs += delta;
      if (bucket === "break") breakMs += delta;
    }
  }

  // Net working time = total session - lunch - breaks
  const checkIn = events.find((e) => e.type === "CHECK_IN")?.at;
  const checkOut = [...events].reverse().find((e) => e.type === "CHECK_OUT")?.at;
  const sessionMs = checkIn && checkOut ? Math.max(0, toMs(checkOut) - toMs(checkIn)) : 0;
  const netWorkMs = Math.max(0, sessionMs - lunchMs - breakMs);

  return { sessionMs, netWorkMs, lunchMs, breakMs };
}

export function msToHhMm(ms: number) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

