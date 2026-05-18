const TZ =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_ORG_TIMEZONE
    ? process.env.NEXT_PUBLIC_ORG_TIMEZONE
    : "Asia/Kolkata";

export function formatTime(d: Date) {
  return d.toLocaleTimeString("en-IN", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

