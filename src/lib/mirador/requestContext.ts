import "server-only";

import { NextRequest } from "next/server";

import {
  MIRADOR_FLOW,
  MIRADOR_FLOW_HEADER,
  MIRADOR_TRACE_ID_HEADER,
} from "./constants";
import { MiradorFlow, MiradorTraceContext } from "./types";

function getMiradorFlowFromHeader(value?: string | null): MiradorFlow | undefined {
  if (!value) {
    return undefined;
  }

  return Object.values(MIRADOR_FLOW).includes(value as MiradorFlow)
    ? (value as MiradorFlow)
    : undefined;
}

export function getMiradorTraceContextFromHeaders(
  request: NextRequest
): MiradorTraceContext | undefined {
  const traceId = request.headers.get(MIRADOR_TRACE_ID_HEADER);
  if (!traceId) {
    return undefined;
  }

  const flow = getMiradorFlowFromHeader(
    request.headers.get(MIRADOR_FLOW_HEADER)
  );

  return {
    traceId,
    flow,
    source: "api",
  };
}
