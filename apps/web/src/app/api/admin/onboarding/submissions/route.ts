import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { listOnboardingSubmissions } from "@/lib/onboarding-supabase";

export async function GET(req: Request) {
  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rows = await listOnboardingSubmissions();
  if (!rows) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        hint: "Set SUPABASE_SERVICE_ROLE_KEY and run supabase/hrms_onboarding_documents.sql.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, submissions: rows });
}
