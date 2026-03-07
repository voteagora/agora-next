"use client";

import type { Trace } from "@miradorlabs/web-sdk/dist/index.esm.js";

import {
  MIRADOR_DEFAULT_TRACE_ID_WAIT_INTERVAL_MS,
  MIRADOR_DEFAULT_TRACE_ID_WAIT_TIMEOUT_MS,
} from "./constants";
import {
  MiradorAttributeMap,
  MiradorAttributeValue,
  MiradorChainName,
  MiradorTraceContext,
} from "./types";
import { getMiradorWebClient } from "./webClient";

type StartMiradorTraceOptions = {
  name: string;
  flow: string;
  context?: MiradorTraceContext;
  tags?: string[];
  attributes?: MiradorAttributeMap;
  includeUserMeta?: boolean;
  autoClose?: boolean;
  autoKeepAlive?: boolean;
  maxRetries?: number;
  retryBackoff?: number;
};

function toAttributeString(value: MiradorAttributeValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function applyContextAttributes(trace: Trace, context?: MiradorTraceContext) {
  if (!context) {
    return;
  }

  const mapped: MiradorAttributeMap = {
    "trace.flow": context.flow,
    "trace.step": context.step,
    "trace.source": context.source,
    "wallet.address": context.walletAddress,
    "wallet.chainId": context.chainId,
    "proposal.branch": context.branch,
    "session.id": context.sessionId,
  };

  for (const [key, value] of Object.entries(mapped)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    trace.addAttribute(key, toAttributeString(value));
  }
}

function applyAttributes(trace: Trace, attributes?: MiradorAttributeMap) {
  if (!attributes) {
    return;
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) {
      continue;
    }
    trace.addAttribute(key, toAttributeString(value));
  }
}

export function startMiradorTrace(
  options: StartMiradorTraceOptions
): Trace | null {
  const client = getMiradorWebClient();
  if (!client) {
    return null;
  }

  try {
    const trace = client.trace({
      name: options.name,
      traceId: options.context?.traceId ?? undefined,
      includeUserMeta: options.includeUserMeta,
      autoClose: options.autoClose,
      autoKeepAlive: options.autoKeepAlive ?? true,
      maxRetries: options.maxRetries,
      retryBackoff: options.retryBackoff,
    });

    applyContextAttributes(trace, {
      ...options.context,
      flow: options.flow,
      source: options.context?.source ?? "frontend",
    });
    applyAttributes(trace, options.attributes);

    if (options.tags && options.tags.length > 0) {
      trace.addTags(options.tags);
    }

    return trace;
  } catch (error) {
    console.error("Failed to create Mirador trace", error);
    return null;
  }
}

export function addMiradorEvent(
  trace: Trace | null | undefined,
  eventName: string,
  details?: Record<string, unknown> | string
) {
  if (!trace) {
    return;
  }

  try {
    trace.addEvent(eventName, details);
  } catch (error) {
    console.error("Failed to add Mirador event", { eventName, error });
  }
}

export function addMiradorAttributes(
  trace: Trace | null | undefined,
  attributes: MiradorAttributeMap
) {
  if (!trace) {
    return;
  }

  try {
    applyAttributes(trace, attributes);
  } catch (error) {
    console.error("Failed to add Mirador attributes", error);
  }
}

export function addMiradorTxHint(
  trace: Trace | null | undefined,
  txHash: string,
  chain: MiradorChainName,
  details?: string
) {
  if (!trace || !txHash) {
    return;
  }

  try {
    trace.addTxHint(txHash, chain, details);
  } catch (error) {
    console.error("Failed to add Mirador tx hint", { txHash, chain, error });
  }
}

export function addMiradorTxInputData(
  trace: Trace | null | undefined,
  inputData: string | null | undefined
) {
  if (!trace || !inputData || inputData === "0x") {
    return;
  }

  try {
    trace.addTxInputData(inputData);
  } catch (error) {
    console.error("Failed to add Mirador tx input data", { error });
  }
}

export function addMiradorSafeMsgHint(
  trace: Trace | null | undefined,
  safeMessageHash: string,
  chain: MiradorChainName,
  details?: string
) {
  if (!trace || !safeMessageHash) {
    return;
  }

  try {
    trace.addSafeMsgHint(safeMessageHash, chain, details);
  } catch (error) {
    console.error("Failed to add Mirador safe message hint", {
      safeMessageHash,
      chain,
      error,
    });
  }
}

export function flushMiradorTrace(trace: Trace | null | undefined) {
  if (!trace) {
    return;
  }

  try {
    trace.flush();
  } catch (error) {
    console.error("Failed to flush Mirador trace", error);
  }
}

export async function flushAndWaitForMiradorTraceId(
  trace: Trace | null | undefined,
  timeoutMs = MIRADOR_DEFAULT_TRACE_ID_WAIT_TIMEOUT_MS,
  pollIntervalMs = MIRADOR_DEFAULT_TRACE_ID_WAIT_INTERVAL_MS
): Promise<string | null> {
  if (!trace) {
    return null;
  }

  try {
    trace.flush();
  } catch (error) {
    console.error("Failed to flush trace before waiting for trace ID", error);
  }

  const start = Date.now();
  while (Date.now() - start <= timeoutMs) {
    const traceId = trace.getTraceId();
    if (traceId) {
      return traceId;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  return trace.getTraceId();
}

export async function closeMiradorTrace(
  trace: Trace | null | undefined,
  reason?: string
) {
  if (!trace) {
    return;
  }

  try {
    await trace.close(reason);
  } catch (error) {
    console.error("Failed to close Mirador trace", { reason, error });
  }
}
