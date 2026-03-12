"use client";

import type { Trace } from "@miradorlabs/web-sdk/dist/index.esm.js";

import {
  MIRADOR_DEFAULT_TRACE_ID_WAIT_INTERVAL_MS,
  MIRADOR_DEFAULT_TRACE_ID_WAIT_TIMEOUT_MS,
} from "./constants";
import { normalizeMiradorAttributePayload } from "./attributeNormalization";
import {
  MiradorAttributeMap,
  MiradorChainName,
  MiradorFlow,
  MiradorTraceContext,
} from "./types";
import { getMiradorWebClient } from "./webClient";

type StartMiradorTraceOptions = {
  name: string;
  flow: MiradorFlow;
  context?: MiradorTraceContext;
  tags?: string[];
  attributes?: MiradorAttributeMap;
  includeUserMeta?: boolean;
  autoClose?: boolean;
  autoKeepAlive?: boolean;
  maxRetries?: number;
  retryBackoff?: number;
};

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

  for (const [key, value] of Object.entries(
    normalizeMiradorAttributePayload(mapped)
  )) {
    trace.addAttribute(key, value);
  }
}

function applyAttributes(trace: Trace, attributes?: MiradorAttributeMap) {
  if (!attributes) {
    return;
  }

  for (const [key, value] of Object.entries(
    normalizeMiradorAttributePayload(attributes)
  )) {
    trace.addAttribute(key, value);
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
    const autoKeepAlive =
      options.autoKeepAlive ?? (options.context?.traceId ? false : true);
    const trace = client.trace({
      name: options.name,
      traceId: options.context?.traceId ?? undefined,
      includeUserMeta: options.includeUserMeta,
      autoClose: options.autoClose,
      autoKeepAlive,
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

export function addMiradorSafeTxHint(
  trace: Trace | null | undefined,
  safeTxHash: string,
  chain: MiradorChainName,
  details?: string
) {
  if (!trace || !safeTxHash) {
    return;
  }

  try {
    trace.addSafeTxHint(safeTxHash, chain, details);
  } catch (error) {
    console.error("Failed to add Mirador safe tx hint", {
      safeTxHash,
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

  const traceId = trace.getTraceId();
  const CLOSE_STEP_TIMEOUT_MS = 1_500;
  const CLOSE_TIMEOUT = Symbol("mirador-close-timeout");

  const awaitWithTimeout = async <T>(
    value: Promise<T>,
    step: "flushQueue" | "close"
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const result = await Promise.race([
        value,
        new Promise<typeof CLOSE_TIMEOUT>((resolve) => {
          timeoutId = setTimeout(
            () => resolve(CLOSE_TIMEOUT),
            CLOSE_STEP_TIMEOUT_MS
          );
        }),
      ]);

      if (result === CLOSE_TIMEOUT) {
        console.warn("[mirador-close] client close timed out", {
          traceId,
          reason,
          step,
          timeoutMs: CLOSE_STEP_TIMEOUT_MS,
        });
      }

      return result;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  try {
    const traceWithInternals = trace as any as {
      autoKeepAlive?: boolean;
      flushQueue?: Promise<void>;
      stopKeepAlive?: () => void;
      close: (reason?: string) => Promise<void>;
    };

    if ("autoKeepAlive" in traceWithInternals) {
      traceWithInternals.autoKeepAlive = false;
    }
    if (typeof traceWithInternals.stopKeepAlive === "function") {
      traceWithInternals.stopKeepAlive();
    }
    if (traceWithInternals.flushQueue) {
      await awaitWithTimeout(traceWithInternals.flushQueue, "flushQueue");
    }

    const closeResult = await awaitWithTimeout(trace.close(reason), "close");
    if (closeResult === CLOSE_TIMEOUT) {
      return;
    }

    console.info("[mirador-close] client close sent", { traceId, reason });
  } catch (error) {
    console.error("[mirador-close] client close failed", {
      traceId,
      reason,
      error,
    });
  }
}
