import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getOnboardingSubmission, patchOnboardingStatus } from "@/lib/onboarding-supabase";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = new Set(["submitted", "reviewing", "approved", "rejected"]);

export async function GET(req: Request, ctx: Ctx) {
  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const row = await getOnboardingSubmission(id);
  if (!row) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, submission: row });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const status = String(body.status ?? "").trim();
  if (!STATUSES.has(status)) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const ok = await patchOnboardingStatus(id, status);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }

  const submission = await getOnboardingSubmission(id);
  return NextResponse.json({ ok: true, submission });
}
