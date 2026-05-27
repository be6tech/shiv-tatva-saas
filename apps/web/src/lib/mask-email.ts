export function maskEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf("@");
  if (at < 1) return "***";
  const user = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const head = user.slice(0, Math.min(2, user.length));
  return `${head}***@${domain}`;
}
