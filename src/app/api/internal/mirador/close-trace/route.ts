export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { closeTraceFromServer } from "@/lib/mirador/serverKeepAlive";

type CloseTraceBody = {
  traceId: string;
  reason?: string;
};

export async function POST(request: NextRequest) {
  let body: CloseTraceBody;
  try {
    body = (await request.json()) as CloseTraceBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { traceId, reason } = body;
  if (!traceId || typeof traceId !== "string") {
    return NextResponse.json(
      { message: "Missing or invalid traceId." },
      { status: 400 }
    );
  }

  const accepted = await closeTraceFromServer(traceId, reason);

  console.info("[mirador-close] server close result", {
    traceId,
    reason,
    accepted,
  });

  return NextResponse.json({ accepted });
}
