import type { TenderlySimulation } from "./types";

function isNonEmpty(s: string | undefined | null): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

const MAX_DEPTH = 48;

function findRevertInCalls(
  calls: unknown[] | null | undefined,
  depth: number
): string | null {
  if (!calls?.length || depth > MAX_DEPTH) return null;
  for (const c of calls) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const er = o.error_reason;
    if (typeof er === "string" && er.trim()) return er;
    const err = o.error;
    if (typeof err === "string" && err.trim()) return err;
    const nested = findRevertInCalls(o.calls as unknown[], depth + 1);
    if (nested) return nested;
  }
  return null;
}

export function extractTenderlyRevertReason(sim: TenderlySimulation): string {
  const txInfo = sim.transaction?.transaction_info;
  if (!txInfo) return "unknown (missing transaction_info)";

  if (isNonEmpty(txInfo.call_trace?.error_reason)) {
    return txInfo.call_trace.error_reason;
  }

  const stack = txInfo.stack_trace;
  if (Array.isArray(stack)) {
    for (const frame of stack) {
      if (!frame) continue;
      if (isNonEmpty(frame.error_reason)) return frame.error_reason;
      if (isNonEmpty(frame.error)) return frame.error;
    }
  }

  const fromCalls = findRevertInCalls(txInfo.call_trace?.calls as unknown[], 0);
  if (fromCalls) return fromCalls;

  const topOut = txInfo.call_trace?.output;
  if (typeof topOut === "string" && topOut.length > 2 && topOut !== "0x") {
    return `no decoded reason (top-level output ${topOut.slice(0, 66)}${topOut.length > 66 ? "…" : ""})`;
  }

  const sid = sim.simulation?.id;
  const hint = sid ? ` See https://tdly.co/shared/simulation/${sid}` : "";
  return `unknown (status false but no error_reason in trace/stack/calls).${hint}`;
}
