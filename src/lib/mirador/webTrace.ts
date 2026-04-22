"use client";

import type {
  Trace,
  Web3Methods,
} from "@miradorlabs/web-sdk/dist/index.esm.js";

import { normalizeMiradorAttributePayload } from "./attributeNormalization";
import {
  MiradorAttributeMap,
  MiradorChainName,
  MiradorFlow,
  MiradorTraceContext,
} from "./types";
import { isMiradorFlowTracingEnabled } from "./config";
import { getMiradorWebClient } from "./webClient";

type MiradorTrace = Trace & Web3Methods;

type StartMiradorTraceOptions = {
  name: string;
  flow: MiradorFlow;
  context?: MiradorTraceContext;
  tags?: string[];
  attributes?: MiradorAttributeMap;
  includeUserMeta?: boolean;
  autoClose?: boolean;
  autoKeepAlive?: boolean;
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
    "proposal.id": context.proposalId,
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
): MiradorTrace | null {
  if (!isMiradorFlowTracingEnabled(options.flow)) {
    return null;
  }

  const client = getMiradorWebClient();
  if (!client) {
    return null;
  }

  try {
    const isResumingExisting = Boolean(options.context?.traceId);
    const autoKeepAlive =
      options.autoKeepAlive ?? (isResumingExisting ? false : true);
    const trace = client.trace({
      name: options.name,
      traceId: options.context?.traceId ?? undefined,
      includeUserMeta: options.includeUserMeta,
      autoClose: options.autoClose,
      autoKeepAlive,
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

    return trace as MiradorTrace;
  } catch (error) {
    console.error("Failed to create Mirador trace", error);
    return null;
  }
}

type EventSeverity = "info" | "warn" | "error";

function inferEventSeverity(eventName: string): EventSeverity {
  if (eventName.endsWith("_failed") || eventName.endsWith("_error")) {
    return "error";
  }

  if (
    eventName.endsWith("_skipped") ||
    eventName.includes("_mismatch") ||
    eventName.endsWith("_replaced")
  ) {
    return "warn";
  }

  return "info";
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
    const severity = inferEventSeverity(eventName);
    trace[severity](eventName, details);
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
  trace: MiradorTrace | null | undefined,
  txHash: string,
  chain: MiradorChainName,
  details?: string
) {
  if (!trace || !txHash) {
    return;
  }

  try {
    trace.web3.evm.addTxHint(txHash, chain, details);
  } catch (error) {
    console.error("Failed to add Mirador tx hint", { txHash, chain, error });
  }
}

export function addMiradorTxInputData(
  trace: MiradorTrace | null | undefined,
  inputData: string | null | undefined
) {
  if (!trace || !inputData || inputData === "0x") {
    return;
  }

  try {
    trace.web3.evm.addInputData(inputData);
  } catch (error) {
    console.error("Failed to add Mirador tx input data", { error });
  }
}

export function addMiradorSafeMsgHint(
  trace: MiradorTrace | null | undefined,
  safeMessageHash: string,
  chain: MiradorChainName,
  details?: string
) {
  if (!trace || !safeMessageHash) {
    return;
  }

  try {
    trace.web3.safe.addMsgHint(safeMessageHash, chain, details);
  } catch (error) {
    console.error("Failed to add Mirador safe message hint", {
      safeMessageHash,
      chain,
      error,
    });
  }
}

export function addMiradorSafeTxHint(
  trace: MiradorTrace | null | undefined,
  safeTxHash: string,
  chain: MiradorChainName,
  details?: string
) {
  if (!trace || !safeTxHash) {
    return;
  }

  try {
    trace.web3.safe.addTxHint(safeTxHash, chain, details);
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

export function getMiradorTraceId(
  trace: Trace | null | undefined
): string | null {
  return trace?.getTraceId() ?? null;
}

/**
 * @deprecated Use getMiradorTraceId() instead. v2 generates trace IDs eagerly.
 */
export async function flushAndWaitForMiradorTraceId(
  trace: Trace | null | undefined
): Promise<string | null> {
  return getMiradorTraceId(trace);
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
    console.error("[mirador-close] client close failed", {
      traceId: trace.getTraceId(),
      reason,
      error,
    });
  }
}
