import { cn } from "@/lib/utils";

/** Outer wrapper — matches marketing home (`page.tsx`). */
export const marketingPageRoot = cn(
  "min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500/25",
  "dark:bg-[#070a12] dark:text-slate-100 dark:selection:bg-orange-500/30"
);

export const marketingSectionLine = "border-b border-border/70 dark:border-white/5";

/** Primary card surface (replaces legacy `glass` on inner marketing pages). */
export const marketingSurface = cn(
  "rounded-3xl border shadow-sm",
  "border-border/80 bg-white",
  "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
);

export const marketingSurfaceHover = cn(
  marketingSurface,
  "transition-colors hover:border-orange-200/70 hover:shadow-md",
  "dark:hover:border-white/15 dark:hover:bg-white/[0.05]"
);

/** Nested tiles inside a marketing card. */
export const marketingInset = cn(
  "rounded-2xl border border-border/60 bg-slate-50/90 p-4",
  "dark:border-white/10 dark:bg-white/[0.05]"
);

export const marketingStrong = "text-slate-900 dark:text-white";

export const marketingBody = "text-slate-600 dark:text-slate-300/90";

export const marketingMuted = "text-slate-500 dark:text-slate-400";

export const marketingList = "text-slate-700 dark:text-slate-200/85";

export const marketingInput = cn(
  "h-11 w-full rounded-xl border border-border/80 bg-white px-4 text-sm outline-none transition",
  "text-slate-900 placeholder:text-slate-400",
  "focus:border-orange-300 focus:ring-2 focus:ring-orange-500/25",
  "dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100 dark:placeholder:text-slate-500",
  "dark:focus:border-white/20 dark:focus:ring-orange-500/20"
);

export const marketingTextarea = cn(marketingInput, "min-h-28 resize-y py-3");

export const marketingPlaceholderBox = cn(
  "flex items-center justify-center rounded-3xl border border-dashed text-xs",
  "border-border/70 bg-slate-50/60 text-slate-500",
  "dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
);
