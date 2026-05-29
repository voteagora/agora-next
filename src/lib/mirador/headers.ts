import { MIRADOR_FLOW_HEADER, MIRADOR_TRACE_ID_HEADER } from "./constants";
import { MiradorFlow, MiradorTraceContext } from "./types";

export function getMiradorTraceHeaders(
  traceContext?: MiradorTraceContext | null
): Record<string, string> {
  if (!traceContext?.traceId) {
    return {};
  }

  const headers: Record<string, string> = {
    [MIRADOR_TRACE_ID_HEADER]: traceContext.traceId,
  };

  if (traceContext.flow) {
    headers[MIRADOR_FLOW_HEADER] = traceContext.flow;
  }

  return headers;
}

export function withMiradorTraceHeaders(
  headers: HeadersInit | undefined,
  traceId?: string | null,
  flow?: MiradorFlow
): Headers {
  const merged = new Headers(headers);

  if (traceId) {
    merged.set(MIRADOR_TRACE_ID_HEADER, traceId);
  }

  if (flow) {
    merged.set(MIRADOR_FLOW_HEADER, flow);
  }

  return merged;
}
