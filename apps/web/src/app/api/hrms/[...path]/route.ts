import { NextRequest, NextResponse } from "next/server";
import { gatewayBaseUrl, signGatewayJwt } from "@/lib/gateway-token";
import { verifySessionBearer } from "@/lib/session-jwt";

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, pathParts: string[]) {
  const session = await verifySessionBearer(req.headers.get("authorization"));
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const path = pathParts.join("/");
  const search = req.nextUrl.search;
  const gwToken = signGatewayJwt(session.sub, session.role);
  const url = `${gatewayBaseUrl()}/${path}${search}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${gwToken}`);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json(
      {
        error: "gateway_unreachable",
        hint: "Start api-gateway (npm run dev in services/api-gateway) or set API_GATEWAY_URL / NEXT_PUBLIC_API_BASE_URL.",
      },
      { status: 503 }
    );
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
