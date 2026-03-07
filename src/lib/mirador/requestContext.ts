import "server-only";

import { NextRequest } from "next/server";

import { MIRADOR_FLOW_HEADER, MIRADOR_TRACE_ID_HEADER } from "./constants";
import { MiradorTraceContext } from "./types";

export function getMiradorTraceContextFromHeaders(
  request: NextRequest
): MiradorTraceContext | undefined {
  const traceId = request.headers.get(MIRADOR_TRACE_ID_HEADER);
  if (!traceId) {
    return undefined;
  }

  const flow = request.headers.get(MIRADOR_FLOW_HEADER) ?? undefined;

  return {
    traceId,
    flow,
    source: "api",
  };
}
