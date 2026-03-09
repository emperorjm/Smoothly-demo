import { NextRequest, NextResponse } from "next/server";

const RPC_TARGET =
  process.env.XION_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443";

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  // Strip /api/rpc prefix, forward the rest (e.g. /status)
  const subPath = url.pathname.replace(/^\/api\/rpc/, "");
  const target = `${RPC_TARGET}${subPath}${url.search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const resp = await fetch(target, init);
  const data = await resp.text();

  return new NextResponse(data, {
    status: resp.status,
    headers: { "Content-Type": resp.headers.get("Content-Type") || "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
