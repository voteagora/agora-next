import { MIRADOR_FLOW_HEADER, MIRADOR_TRACE_ID_HEADER } from "./constants";
import { MiradorTraceContext } from "./types";

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
