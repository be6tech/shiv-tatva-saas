import { PageShell } from "@/components/marketing/page-shell";
import { marketingSurfaceHover, marketingBody, marketingStrong } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginLanding() {
  return (
    <PageShell
      title="Login"
      subtitle="Choose your portal. Admin and Employee experiences are separate for security and role-based access."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/login/admin" className={cn(marketingSurfaceHover, "block p-7")}>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
            Admin Portal
          </div>
          <div className={cn("mt-3 text-xl font-semibold", marketingStrong)}>Admin Login</div>
          <p className={cn("mt-2 text-sm", marketingBody)}>
            Manage employees, attendance, leave, payroll, analytics, and system settings.
          </p>
        </Link>

        <Link href="/login/employee" className={cn(marketingSurfaceHover, "block p-7")}>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-[#ea580c] dark:text-[#f97316]" />
            Employee Portal
          </div>
          <div className={cn("mt-3 text-xl font-semibold", marketingStrong)}>Employee Login</div>
          <p className={cn("mt-2 text-sm", marketingBody)}>
            Track attendance, request leaves, view payslips, manage profile, tasks, and notifications.
          </p>
        </Link>
      </div>
    </PageShell>
  );
}
