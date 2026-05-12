export function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

