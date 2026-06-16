import "server-only";

import type {
  Trace as MiradorServerTrace,
  Web3Methods,
} from "@miradorlabs/nodejs-sdk";

import { normalizeMiradorAttributePayload } from "./attributeNormalization";
import { isMiradorFlowTracingEnabled } from "./config";
import { inferMiradorEventSeverity } from "./eventSeverity";
import { getMiradorServerClient } from "./serverClient";
import { getTenantTag } from "./tags";
import {
  MiradorAttributeMap,
  MiradorChainName,
  MiradorTraceSource,
  MiradorTraceContext,
} from "./types";

type MiradorServerTraceWithWeb3 = MiradorServerTrace & Web3Methods;

type MiradorTxHashHint = {
  txHash: string;
  chain: MiradorChainName;
  details?: string;
};

type MiradorSafeMessageHint = {
  safeMessageHash: string;
  chain: MiradorChainName;
  details?: string;
};

type MiradorSafeTxHint = {
  safeTxHash: string;
  chain: MiradorChainName;
  details?: string;
};

type AppendServerTraceEventArgs = {
  traceContext?: MiradorTraceContext | null;
  eventName: string;
  details?: Record<string, unknown> | string;
  attributes?: MiradorAttributeMap;
  tags?: string[];
  txHashHints?: MiradorTxHashHint[];
  safeMessageHints?: MiradorSafeMessageHint[];
  safeTxHints?: MiradorSafeTxHint[];
  txInputData?: string | string[];
  error?: unknown;
};

const MIRADOR_SERVER_DEFAULT_TRACE_NAME = "AgoraServerTrace";
let hasWarnedMissingTraceId = false;

function buildContextAttributes(
  traceContext?: MiradorTraceContext | null
): MiradorAttributeMap {
  if (!traceContext) {
    return {};
  }

  return {
    "trace.flow": traceContext.flow,
    "trace.step": traceContext.step,
    "trace.source": traceContext.source,
    "wallet.address": traceContext.walletAddress,
    "wallet.chainId": traceContext.chainId,
    "proposal.id": traceContext.proposalId,
    "proposal.branch": traceContext.branch,
    "session.id": traceContext.sessionId,
  };
}

function toEventDetails(
  details?: Record<string, unknown> | string
): string | undefined {
  if (details === undefined) {
    return undefined;
  }

  if (typeof details === "string") {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

function normalizeTxInputData(txInputData?: string | string[]): string[] {
  if (!txInputData) {
    return [];
  }

  const values = Array.isArray(txInputData) ? txInputData : [txInputData];
  return values.filter(
    (value) => typeof value === "string" && value.length > 0 && value !== "0x"
  );
}

function normalizeTxHashHints(
  txHashHints?: MiradorTxHashHint[]
): MiradorTxHashHint[] {
  if (!txHashHints) {
    return [];
  }

  return txHashHints.filter((hint) => Boolean(hint?.txHash && hint?.chain));
}

function normalizeSafeMessageHints(
  safeMessageHints?: MiradorSafeMessageHint[]
): MiradorSafeMessageHint[] {
  if (!safeMessageHints) {
    return [];
  }

  return safeMessageHints.filter((hint) =>
    Boolean(hint?.safeMessageHash && hint?.chain)
  );
}

function normalizeSafeTxHints(
  safeTxHints?: MiradorSafeTxHint[]
): MiradorSafeTxHint[] {
  if (!safeTxHints) {
    return [];
  }

  return safeTxHints.filter((hint) => Boolean(hint?.safeTxHash && hint?.chain));
}

export async function appendServerTraceEvent({
  traceContext,
  eventName,
  details,
  attributes,
  tags,
  txHashHints,
  safeMessageHints,
  safeTxHints,
  txInputData,
  error,
}: AppendServerTraceEventArgs): Promise<void> {
  const traceId = traceContext?.traceId;

  try {
    if (traceContext?.flow && !isMiradorFlowTracingEnabled(traceContext.flow)) {
      return;
    }

    if (!traceId) {
      if (process.env.NODE_ENV !== "production" && !hasWarnedMissingTraceId) {
        hasWarnedMissingTraceId = true;
        console.warn(
          "Mirador server trace event skipped because traceId is missing.",
          {
            eventName,
            flow: traceContext?.flow,
            step: traceContext?.step,
          }
        );
      }
      return;
    }

    const client = getMiradorServerClient();
    if (!client) {
      return;
    }

    const attributePayload = normalizeMiradorAttributePayload({
      ...buildContextAttributes(traceContext),
      ...attributes,
    });

    const trace = client.trace({
      name: traceContext?.flow ?? MIRADOR_SERVER_DEFAULT_TRACE_NAME,
      traceId,
      captureStackTrace: false,
      autoKeepAlive: false,
    });

    if (Object.keys(attributePayload).length > 0) {
      trace.addAttributes(attributePayload);
    }

    const tenantTag = getTenantTag();
    const allTags = [...(tenantTag ? [tenantTag] : []), ...(tags ?? [])];
    if (allTags.length > 0) {
      trace.addTags(allTags);
    }

    const severity = inferMiradorEventSeverity(eventName, details);
    trace[severity](eventName, toEventDetails(details));

    if (error instanceof Error && error.stack) {
      try {
        // Raw V8 stack only; the SDK accepts an empty frames array.
        trace.addExistingStackTrace(
          { frames: [], raw: error.stack },
          eventName,
          {
            name: error.name,
            message: error.message,
          }
        );
      } catch (stackTraceError) {
        // The flush below must still run when stack attachment fails.
        console.error("Failed to attach Mirador stack trace", {
          traceId,
          eventName,
          error: stackTraceError,
        });
      }
    }

    const web3Trace = trace as MiradorServerTraceWithWeb3;

    for (const inputData of normalizeTxInputData(txInputData)) {
      web3Trace.web3.evm.addInputData(inputData);
    }

    for (const hint of normalizeTxHashHints(txHashHints)) {
      web3Trace.web3.evm.addTxHint(hint.txHash, hint.chain, hint.details);
    }

    for (const hint of normalizeSafeMessageHints(safeMessageHints)) {
      web3Trace.web3.safe.addMsgHint(
        hint.safeMessageHash,
        hint.chain,
        hint.details ?? undefined
      );
    }

    for (const hint of normalizeSafeTxHints(safeTxHints)) {
      web3Trace.web3.safe.addTxHint(hint.safeTxHash, hint.chain, hint.details);
    }

    // Mirador's server SDK enqueues the flush and returns immediately.
    trace.flush();
  } catch (appendError) {
    console.error("Failed to append Mirador server trace event", {
      traceId,
      eventName,
      error: appendError,
    });
  }
}

export function withMiradorTraceStep(
  traceContext: MiradorTraceContext | null | undefined,
  step: string,
  source: MiradorTraceSource = "backend"
): MiradorTraceContext | undefined {
  if (!traceContext) {
    return undefined;
  }

  return {
    ...traceContext,
    step,
    source,
  };
}
