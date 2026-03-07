// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import { NextResponse, type NextRequest } from "next/server";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";

export async function GET(request: NextRequest) {
  const { generateNonce } = await import("siwe");
  const traceContext = getMiradorTraceContextFromHeaders(request);

  try {
    const nonce = generateNonce();
    await appendServerTraceEvent({
      traceContext: traceContext
        ? { ...traceContext, step: "siwe_nonce", source: "api" }
        : undefined,
      eventName: "siwe_nonce_generated",
    });
    return NextResponse.json({ nonce });
  } catch (e: any) {
    await appendServerTraceEvent({
      traceContext: traceContext
        ? { ...traceContext, step: "siwe_nonce", source: "api" }
        : undefined,
      eventName: "siwe_nonce_failed",
      details: { message: e?.toString?.() ?? "Unknown error" },
    });
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
