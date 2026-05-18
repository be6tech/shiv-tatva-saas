/** Net work metrics from attendance events (9h target excludes lunch/break). */

export function sumPairMinutes(events, startType, endType, now = new Date()) {
  const starts = events.filter((e) => e.type === startType).map((e) => new Date(e.at).getTime());
  const ends = events.filter((e) => e.type === endType).map((e) => new Date(e.at).getTime());
  const nowMs = now.getTime();
  let acc = 0;
  const paired = Math.min(starts.length, ends.length);
  for (let i = 0; i < paired; i++) acc += Math.max(0, ends[i] - starts[i]);
  if (starts.length > ends.length) {
    acc += Math.max(0, nowMs - starts[starts.length - 1]);
  }
  return Math.floor(acc / 60000);
}

export function computeNetWorkMetrics(events, workTargetMinutes = 540, now = new Date()) {
  const list = events ?? [];
  const checkInAt = list.find((e) => e.type === "CHECK_IN")?.at ?? null;
  if (!checkInAt) {
    return {
      checkInAt: null,
      checkOutAt: null,
      netWorkMinutes: 0,
      lunchMinutes: 0,
      breakMinutes: 0,
      workTargetMinutes,
      remainingWorkMinutes: workTargetMinutes,
      expectedCheckOutAt: null,
    };
  }

  const checkOutAt = [...list].reverse().find((e) => e.type === "CHECK_OUT")?.at ?? null;
  const endMs = checkOutAt ? new Date(checkOutAt).getTime() : now.getTime();
  const sessionMinutes = Math.max(0, Math.floor((endMs - new Date(checkInAt).getTime()) / 60000));
  const lunchMinutes = sumPairMinutes(list, "LUNCH_IN", "LUNCH_OUT", now);
  const breakMinutes = sumPairMinutes(list, "BREAK_IN", "BREAK_OUT", now);
  const netWorkMinutes = Math.max(0, sessionMinutes - lunchMinutes - breakMinutes);
  const remainingWorkMinutes = Math.max(0, workTargetMinutes - netWorkMinutes);
  const expectedCheckOutAt = new Date(
    new Date(checkInAt).getTime() +
      (workTargetMinutes + lunchMinutes + breakMinutes) * 60 * 1000
  ).toISOString();

  return {
    checkInAt,
    checkOutAt,
    netWorkMinutes,
    lunchMinutes,
    breakMinutes,
    workTargetMinutes,
    remainingWorkMinutes,
    expectedCheckOutAt,
  };
}

/** Pair lunch/break in-out times from events for database columns. */
export function extractLunchBreakTimes(events) {
  const list = events ?? [];
  const lunchIns = list.filter((e) => e.type === "LUNCH_IN").map((e) => e.at);
  const lunchOuts = list.filter((e) => e.type === "LUNCH_OUT").map((e) => e.at);
  const breakIns = list.filter((e) => e.type === "BREAK_IN").map((e) => e.at);
  const breakOuts = list.filter((e) => e.type === "BREAK_OUT").map((e) => e.at);

  const lunchSessions = lunchIns.map((inAt, i) => ({
    in: inAt,
    out: lunchOuts[i] ?? null,
  }));
  const breakSessions = breakIns.map((inAt, i) => ({
    in: inAt,
    out: breakOuts[i] ?? null,
  }));

  return {
    lunchInAt: lunchIns[0] ?? null,
    lunchOutAt: lunchOuts[0] ?? null,
    breakInAt: breakIns[0] ?? null,
    breakOutAt: breakOuts[0] ?? null,
    lunchSessions,
    breakSessions,
  };
}

/** Fields stored in hrms_attendance (columns + metadata). */
export function enrichAttendanceDay(day, workTargetMinutes = 540) {
  if (!day) return day;
  const events = day.events ?? [];
  const metrics = computeNetWorkMetrics(events, workTargetMinutes);
  const lunchBreak = extractLunchBreakTimes(events);
  return { ...day, ...metrics, ...lunchBreak };
}
