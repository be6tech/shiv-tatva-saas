import { NextRequest, NextResponse } from "next/server";
import { gatewayBaseUrl, signGatewayJwt, shouldUseHrmsFallback } from "@/lib/gateway-token";
import { hrmsFallbackResponse } from "@/lib/hrms-fallback";
import { verifySessionRequest } from "@/lib/session-jwt";

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, pathParts: string[]) {
  const session = await verifySessionRequest(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const path = pathParts.join("/");
  const search = req.nextUrl.search;

  if (shouldUseHrmsFallback()) {
    const fallback = hrmsFallbackResponse(req.method, path, search, session);
    if (fallback) return fallback;
    return NextResponse.json(
      {
        error: "gateway_not_configured",
        hint:
          "Deploy api-gateway (Render: connect repo + render.yaml) and set API_GATEWAY_URL + JWT_SECRET on Vercel (same JWT_SECRET as Render).",
      },
      { status: 503 }
    );
  }

  const base = gatewayBaseUrl()!;
  const gwToken = signGatewayJwt(session.sub, session.role);
  const url = `${base}/${path}${search}`;

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
    if (req.method === "GET" || req.method === "HEAD") {
      const fallback = hrmsFallbackResponse(req.method, path, search, session);
      if (fallback) return fallback;
    }
    return NextResponse.json(
      {
        error: "gateway_unreachable",
        hint: `Cannot reach ${base}. Ensure Render api-gateway is awake and JWT_SECRET matches on Vercel and Render.`,
      },
      { status: 503 }
    );
  }

  if (!upstream.ok && upstream.status >= 500) {
    if (req.method === "GET" || req.method === "HEAD") {
      const fallback = hrmsFallbackResponse(req.method, path, search, session);
      if (fallback) return fallback;
    }
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
