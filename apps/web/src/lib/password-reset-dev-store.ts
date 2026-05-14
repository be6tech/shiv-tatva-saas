import "server-only";

type Entry = { otp: string; expiresAt: number; employeeId: string; email: string };

const store = new Map<string, Entry>();

function keyFor(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export function putDevResetOtp(identifier: string, employeeId: string, email: string, otp: string, expiresAt: string) {
  store.set(keyFor(identifier), {
    otp,
    employeeId,
    email,
    expiresAt: new Date(expiresAt).getTime(),
  });
  store.set(keyFor(employeeId), store.get(keyFor(identifier))!);
  store.set(keyFor(email), store.get(keyFor(identifier))!);
}

export function verifyDevResetOtp(identifier: string, otp: string): { employeeId: string; email: string } | null {
  const entry = store.get(keyFor(identifier));
  if (!entry || entry.expiresAt < Date.now() || entry.otp !== otp) return null;
  store.delete(keyFor(identifier));
  store.delete(keyFor(entry.employeeId));
  store.delete(keyFor(entry.email));
  return { employeeId: entry.employeeId, email: entry.email };
}
