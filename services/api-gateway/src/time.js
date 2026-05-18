/** Organization timezone for attendance calendar day and displayed times. */
export function orgTimezone() {
  return process.env.ORG_TIMEZONE?.trim() || "Asia/Kolkata";
}

/** Calendar date YYYY-MM-DD in org timezone (for attendance day key). */
export function attendanceDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: orgTimezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Current instant as UTC ISO (for timestamptz columns). */
export function utcNowIso(date = new Date()) {
  return date.toISOString();
}

/** Wall-clock time in org timezone: `YYYY-MM-DD HH:mm:ss` (for readable DB columns). */
export function toLocalDateTimeString(isoOrDate) {
  if (!isoOrDate) return null;
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: orgTimezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export function toLocalDateTimeStrings(isoOrDate) {
  const utc = isoOrDate ? utcNowIso(isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)) : null;
  return {
    utc,
    local: toLocalDateTimeString(isoOrDate),
  };
}
