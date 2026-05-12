import { cn } from "@/lib/utils";

/** Dashboard UI placeholders (`/public/marketing/product-previews/`). */
const previewSrc: Record<string, string> = {
  hrms: "/marketing/product-previews/product-preview-hrms.png",
  crm: "/marketing/product-previews/product-preview-crm.png",
  erp: "/marketing/product-previews/product-preview-erp.png",
  payroll: "/marketing/product-previews/product-preview-payroll.png",
  tracking: "/marketing/product-previews/product-preview-tracking.png",
  "ai-analytics": "/marketing/product-previews/product-preview-ai-analytics.png",
};

export function ProductUIPreview({
  productId,
  title,
  className,
}: {
  productId: string;
  title: string;
  className?: string;
}) {
  const src = previewSrc[productId];
  if (!src) return null;

  return (
    <div
      className={cn(
        "relative mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-100 ring-1 ring-slate-200/80 dark:border-white/10 dark:bg-slate-900/80 dark:ring-white/5",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local marketing placeholders */}
      <img
        src={src}
        alt={`${title} product UI`}
        width={960}
        height={540}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
    </div>
  );
}
