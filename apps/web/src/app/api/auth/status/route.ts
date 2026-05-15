import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/admin-auth";

export async function GET() {
  const cfg = getSupabaseAdminConfig();
  return NextResponse.json({
    supabase: !!cfg,
    jwt: !!(process.env.JWT_SECRET?.trim() || process.env.NODE_ENV === "development"),
  });
}
