"use client";

import { buildFrontendTraceContext } from "./clientTraceContext";
import { getMiradorChainNameFromChainId } from "./chains";
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

  addMiradorTxInputData(trace, inputData);

  const miradorChain = getMiradorChainNameFromChainId(chainId);
  if (!miradorChain) {
    return;
  }

  if (submittedTxHash && txHash && submittedTxHash !== txHash) {
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

  const resolvedTxHash = txHash ?? submittedTxHash;
  if (resolvedTxHash) {
    addMiradorTxHint(trace, resolvedTxHash, miradorChain, txDetails);
  }
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
