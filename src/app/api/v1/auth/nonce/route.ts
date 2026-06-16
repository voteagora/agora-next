export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import { storeSiweNonce } from "@/lib/siweNonce.server";

export async function GET(request: NextRequest) {
  const { generateNonce } = await import("siwe");
  const traceContext = getMiradorTraceContextFromHeaders(request);
  const requestUrl = new URL(request.url);

  try {
    const nonce = generateNonce();
    await storeSiweNonce(nonce, requestUrl.host);
    appendServerTraceEvent({
      traceContext: traceContext
        ? { ...traceContext, step: "siwe_nonce", source: "api" }
        : undefined,
      eventName: "siwe_nonce_generated",
    });
    return NextResponse.json(
      { nonce },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    appendServerTraceEvent({
      traceContext: traceContext
        ? { ...traceContext, step: "siwe_nonce", source: "api" }
        : undefined,
      eventName: "siwe_nonce_failed",
      details: { message: e?.toString?.() ?? "Unknown error" },
      error: e,
    });
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
