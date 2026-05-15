import { NextResponse } from "next/server";
import { verifySessionRequest } from "@/lib/session-jwt";

export async function GET(req: Request) {
  const session = await verifySessionRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: { id: session.sub, role: session.role },
  });
}
