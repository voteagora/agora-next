export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

/**
 * Temporary sink for client-side Privy diagnostics (see src/lib/privyDebug.ts).
 * Lives outside /api/v1 on purpose: the middleware requires a bearer token
 * there, and these events are emitted before the user has any session.
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const entries: unknown[] = Array.isArray(body?.entries)
    ? body.entries.slice(0, 100)
    : [];
  const meta = {
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    ua: request.headers.get("user-agent")?.slice(0, 160),
    receivedAt: new Date().toISOString(),
  };
  for (const entry of entries) {
    const line = JSON.stringify({ ...meta, ...(entry as object) });
    console.log("[privy-debug][client]", line.slice(0, 16_000));
  }
  return NextResponse.json(
    { ok: true, received: entries.length },
    { headers: { "Cache-Control": "no-store" } }
  );
}
