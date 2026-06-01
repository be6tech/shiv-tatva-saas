/** Per-file cap (keeps multipart + Supabase JSON row under platform limits). */
export const ONBOARDING_MAX_FILE_BYTES = 350_000;

/** Sum of all required uploads (multipart + base64 JSON to Supabase). */
export const ONBOARDING_MAX_TOTAL_BYTES = 2_800_000;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
