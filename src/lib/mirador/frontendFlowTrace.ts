"use client";

import { RefObject, useEffect, useRef } from "react";
import { buildFrontendTraceContext } from "./clientTraceContext";
import { getMiradorChainNameFromChainId } from "./chains";
import { isMiradorFlowTracingEnabled } from "./config";
import { getMiradorFlowTags } from "./tags";
import { MiradorAttributeMap, MiradorFlow, MiradorTraceContext } from "./types";
import {
  addMiradorEvent,
  addMiradorSafeTxHint,
  addMiradorTxHint,
  addMiradorTxInputData,
  closeMiradorTrace,
  startMiradorTrace,
} from "./webTrace";

export type FrontendMiradorTrace = ReturnType<typeof startMiradorTrace>;

type StartFrontendMiradorFlowTraceOptions = {
  name: string;
  flow: MiradorFlow;
  step: string;
  context?: Omit<MiradorTraceContext, "traceId" | "flow" | "source" | "step">;
  tags?: string[];
  attributes?: MiradorAttributeMap;
  startEventName?: string;
  startEventDetails?: Record<string, unknown>;
};

type FrontendTraceStepContext = Omit<
  MiradorTraceContext,
  "traceId" | "flow" | "source" | "step"
>;

type AttachMiradorTransactionArtifactsOptions = {
  chainId?: number | string;
  inputData?: string | null;
  submittedTxHash?: string | null;
  txHash?: string | null;
  submittedTxType?: "tx" | "safe";
  submittedTxDetails?: string;
  txDetails?: string;
};

export function startFrontendMiradorFlowTrace({
  name,
  flow,
  step,
  context,
  tags,
  attributes,
  startEventName,
  startEventDetails,
}: StartFrontendMiradorFlowTraceOptions): FrontendMiradorTrace {
  if (!isMiradorFlowTracingEnabled(flow)) {
    return null;
  }

  const trace = startMiradorTrace({
    name,
    flow,
    context: {
      ...context,
      source: "frontend",
      step,
    },
    tags: getMiradorFlowTags(flow, tags),
    attributes,
  });

  if (trace && startEventName) {
    addMiradorEvent(trace, startEventName, startEventDetails);
  }

  return trace;
}

export function getFrontendMiradorTraceContext(
  trace: FrontendMiradorTrace,
  {
    flow,
    step,
    context,
  }: {
    flow: MiradorFlow;
    step: string;
    context?: FrontendTraceStepContext;
  }
): MiradorTraceContext | undefined {
  return buildFrontendTraceContext(trace, {
    flow,
    step,
    source: "frontend",
    ...context,
  });
}

export function attachMiradorTransactionArtifacts(
  trace: FrontendMiradorTrace,
  {
    chainId,
    inputData,
    submittedTxHash,
    txHash,
    submittedTxType = "tx",
    submittedTxDetails,
    txDetails,
  }: AttachMiradorTransactionArtifactsOptions
) {
  if (!trace) {
    return;
  }

  if (inputData) {
    addMiradorTxInputData(trace, inputData);
  }

  const miradorChain = getMiradorChainNameFromChainId(chainId);
  if (!miradorChain) {
    return;
  }

  // Attach the submitted hash whenever it is known and distinct from the
  // resolved on-chain hash. Calling this at submission time (with `txHash`
  // absent) lets Mirador begin watching the tx from mempool instead of only
  // correlating it after the receipt resolves.
  if (submittedTxHash && submittedTxHash !== txHash) {
    if (submittedTxType === "safe") {
      addMiradorSafeTxHint(
        trace,
        submittedTxHash,
        miradorChain,
        submittedTxDetails
      );
    } else {
      addMiradorTxHint(
        trace,
        submittedTxHash,
        miradorChain,
        submittedTxDetails
      );
    }
  }

  if (txHash) {
    addMiradorTxHint(trace, txHash, miradorChain, txDetails);
  }
}

/**
 * Watches a wagmi-style transaction hash and attaches it to the active trace
 * as a submitted tx hint the moment it becomes defined. This lets Mirador
 * start watching the tx from mempool — independent of receipt outcome — so
 * reverted and dropped transactions remain observable.
 *
 * Idempotent against repeated renders: the same hash is attached at most once
 * per component instance.
 */
export function useAttachMiradorSubmittedTxHash({
  traceRef,
  txHash,
  chainId,
  details,
  enabled = true,
}: {
  traceRef: RefObject<FrontendMiradorTrace>;
  txHash: string | null | undefined;
  chainId?: number | string;
  details: string;
  enabled?: boolean;
}) {
  const attachedHashRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      !enabled ||
      !traceRef.current ||
      !txHash ||
      attachedHashRef.current === txHash
    ) {
      return;
    }
    attachMiradorTransactionArtifacts(traceRef.current, {
      chainId,
      submittedTxHash: txHash,
      submittedTxDetails: details,
    });
    attachedHashRef.current = txHash;
  }, [chainId, details, enabled, traceRef, txHash]);
}

export async function closeFrontendMiradorFlowTrace(
  trace: FrontendMiradorTrace,
  {
    reason,
    eventName,
    details,
  }: {
    reason: string;
    eventName?: string;
    details?: Record<string, unknown>;
  }
) {
  if (!trace) {
    return;
  }

  if (eventName) {
    addMiradorEvent(trace, eventName, details);
  }

  await closeMiradorTrace(trace, reason);
}
