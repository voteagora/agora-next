import "server-only";

import { getMiradorServerClient } from "./serverClient";
import {
  MiradorAttributeMap,
  MiradorAttributeValue,
  MiradorChainName,
  MiradorTraceContext,
} from "./types";

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

type AppendServerTraceEventArgs = {
  traceContext?: MiradorTraceContext | null;
  eventName: string;
  details?: Record<string, unknown> | string;
  attributes?: MiradorAttributeMap;
  tags?: string[];
  txHashHints?: MiradorTxHashHint[];
  safeMessageHints?: MiradorSafeMessageHint[];
  txInputData?: string | string[];
};

const MIRADOR_SERVER_UPDATE_MAX_RETRIES = 3;
const MIRADOR_SERVER_UPDATE_RETRY_BASE_MS = 200;
const MIRADOR_SERVER_DEFAULT_TRACE_NAME = "AgoraServerTrace";
let hasWarnedMissingTraceId = false;

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
    "proposal.branch": traceContext.branch,
    "session.id": traceContext.sessionId,
  };
}

function buildAttributePayload(
  attributes?: MiradorAttributeMap
): Record<string, string> {
  if (!attributes) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) {
      continue;
    }
    normalized[key] = toAttributeString(value);
  }

  return normalized;
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

export async function appendServerTraceEvent({
  traceContext,
  eventName,
  details,
  attributes,
  tags,
  txHashHints,
  safeMessageHints,
  txInputData,
}: AppendServerTraceEventArgs): Promise<void> {
  const traceId = traceContext?.traceId;
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

  const attributePayload = buildAttributePayload({
    ...buildContextAttributes(traceContext),
    ...attributes,
  });

  try {
    const trace = client.trace({
      name: traceContext?.flow ?? MIRADOR_SERVER_DEFAULT_TRACE_NAME,
      traceId,
      captureStackTrace: false,
      maxRetries: MIRADOR_SERVER_UPDATE_MAX_RETRIES,
      retryBackoff: MIRADOR_SERVER_UPDATE_RETRY_BASE_MS,
      autoKeepAlive: false,
    });

    if (Object.keys(attributePayload).length > 0) {
      trace.addAttributes(attributePayload);
    }

    if (tags && tags.length > 0) {
      trace.addTags(tags);
    }

    trace.addEvent(eventName, toEventDetails(details));

    for (const inputData of normalizeTxInputData(txInputData)) {
      trace.addTxInputData(inputData);
    }

    for (const hint of normalizeTxHashHints(txHashHints)) {
      trace.addTxHint(hint.txHash, hint.chain, hint.details);
    }

    for (const hint of normalizeSafeMessageHints(safeMessageHints)) {
      trace.addSafeMsgHint(
        hint.safeMessageHash,
        hint.chain,
        hint.details ?? undefined
      );
    }

    trace.flush();
  } catch (error) {
    console.error("Failed to append Mirador server trace event", {
      traceId,
      eventName,
      error,
    });
  }
}
