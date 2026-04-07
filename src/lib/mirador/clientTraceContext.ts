"use client";

import type { Trace } from "@miradorlabs/web-sdk/dist/index.esm.js";

import { MiradorFlow, MiradorTraceContext } from "./types";

type BuildFrontendTraceContextOptions = Omit<
  MiradorTraceContext,
  "traceId" | "source"
> & {
  flow: MiradorFlow;
  step: string;
  source?: "frontend";
};

export function buildFrontendTraceContext(
  trace: Trace | null | undefined,
  context: BuildFrontendTraceContextOptions
): MiradorTraceContext | undefined {
  if (!trace) {
    return undefined;
  }

  const traceId = trace.getTraceId();
  if (!traceId) {
    return undefined;
  }

  return {
    traceId,
    source: context.source ?? "frontend",
    ...context,
  };
}
