import { cn } from "@/lib/utils";

/** Workflow diagram placeholders (`/public/marketing/solution-workflows/`). */
const workflowSrc: Record<string, string> = {
  startups: "/marketing/solution-workflows/workflow-startups.png",
  enterprises: "/marketing/solution-workflows/workflow-enterprises.png",
  education: "/marketing/solution-workflows/workflow-education.png",
  healthcare: "/marketing/solution-workflows/workflow-healthcare.png",
  retail: "/marketing/solution-workflows/workflow-retail.png",
  manufacturing: "/marketing/solution-workflows/workflow-manufacturing.png",
};

export function SolutionWorkflowPreview({
  solutionId,
  title,
  className,
}: {
  solutionId: string;
  title: string;
  className?: string;
}) {
  const src = workflowSrc[solutionId];
  if (!src) return null;

  return (
    <div
      className={cn(
        "relative mt-5 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-100 ring-1 ring-slate-200/80 dark:border-white/10 dark:bg-slate-900/80 dark:ring-white/5",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local marketing placeholders */}
      <img
        src={src}
        alt={`${title} workflow diagram`}
        width={960}
        height={480}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}
