import { PageShell } from "@/components/marketing/page-shell";
import { marketingSurface, marketingBody } from "@/components/marketing/marketing-styles";
import { cn } from "@/lib/utils";

export default function TermsPage() {
  return (
    <PageShell title="Terms & Conditions" subtitle="Enterprise SaaS terms placeholder.">
      <div className={cn(marketingSurface, "p-6 text-sm leading-7", marketingBody)}>
        <p>
          This is a starter terms page. Replace with your official terms, service scope, SLAs, limitations, and
          acceptable use policies.
        </p>
      </div>
    </PageShell>
  );
}
