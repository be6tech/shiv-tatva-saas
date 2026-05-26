import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getOnboardingSubmission } from "@/lib/onboarding-supabase";
import {
  ONBOARDING_FILE_KEYS,
  ONBOARDING_OPTIONAL_FILE_KEYS,
} from "@/lib/onboarding-fields";

type Ctx = { params: Promise<{ id: string; fileKey: string }> };

const ALLOWED = new Set<string>([
  ...ONBOARDING_FILE_KEYS,
  ...ONBOARDING_OPTIONAL_FILE_KEYS,
]);

export async function GET(req: Request, ctx: Ctx) {
  const admin = await verifyAdminRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id, fileKey } = await ctx.params;
  if (!ALLOWED.has(fileKey)) {
    return NextResponse.json({ error: "invalid_file" }, { status: 400 });
  }

  const row = await getOnboardingSubmission(id);
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const file = row.files[fileKey];
  if (!file?.data) {
    return NextResponse.json({ error: "file_missing" }, { status: 404 });
  }

  const buf = Buffer.from(file.data, "base64");
  const mime = file.mime || "application/octet-stream";
  const download = new URL(req.url).searchParams.get("download") === "1";

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(buf.length),
      "Cache-Control": "private, no-store",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(file.filename || fileKey)}"`,
    },
  });
}
