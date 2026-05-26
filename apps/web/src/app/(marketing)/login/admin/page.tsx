import { Suspense } from "react";
import { LoginPortal } from "@/components/auth/login-portal";

function LoginFallback() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" aria-hidden />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPortal initialTab="admin" />
    </Suspense>
  );
}
