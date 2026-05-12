import { API_BASE } from "@/lib/api";

export function LoginErrorAlert({
  message,
  showNetworkHint,
}: {
  message: string | null;
  showNetworkHint: boolean;
}) {
  if (!message) return null;

  return (
    <div
      className="rounded-xl border border-destructive/35 bg-destructive/5 px-3 py-2.5"
      role="alert"
    >
      <p className="text-sm font-medium text-destructive">{message}</p>
      {showNetworkHint ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          The API at{" "}
          <span className="break-all font-mono text-[11px] text-foreground/85">{API_BASE}</span> is
          not responding. From the project folder run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            npm run dev
          </code>{" "}
          (starts web + API), or run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            npm run dev:api
          </code>{" "}
          in a second terminal if the site is already running.
        </p>
      ) : null}
    </div>
  );
}
