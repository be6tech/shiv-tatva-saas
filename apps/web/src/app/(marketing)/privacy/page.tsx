import { PageShell } from "@/components/marketing/page-shell";
import { marketingSurface, marketingBody } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" subtitle="Premium enterprise privacy and data protection principles.">
      <div className={cn(marketingSurface, "p-6 text-sm leading-7", marketingBody)}>
        <p>
          This is a starter policy page. Replace with your legal text covering data collection, processing, retention,
          security, and user rights.
        </p>
        <p className="mt-4">
          The platform is designed for enterprise-grade security including JWT/OAuth, RBAC, HTTPS, and optional MFA.
        </p>
      </div>
    </PageShell>
  );
}
