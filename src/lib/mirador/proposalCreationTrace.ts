"use client";

import {
  isMiradorProposalCreationTracingEnabled,
  isMiradorSiweLoginTracingEnabled,
} from "./config";
import {
  MIRADOR_FLOW,
  PROPOSAL_CREATION_TRACE_NAME,
  PROPOSAL_CREATION_TRACE_STORAGE_KEY,
} from "./constants";
import { getMiradorTraceHeaders } from "./headers";
import { getMiradorFlowTags } from "./tags";
import {
  MiradorTraceContext,
  ProposalCreationBranch,
  ProposalCreationTraceState,
} from "./types";
import {
  addMiradorAttributes,
  addMiradorEvent,
  closeMiradorTrace,
  flushAndWaitForMiradorTraceId,
  flushMiradorTrace,
  startMiradorTrace,
} from "./webTrace";

export { isMiradorProposalCreationTracingEnabled } from "./config";

type ProposalCreationTraceLike = ReturnType<typeof startMiradorTrace>;
let activeProposalCreationTrace: ProposalCreationTraceLike = null;
let activeProposalCreationTraceId: string | null = null;

function clearActiveProposalCreationTrace() {
  activeProposalCreationTrace = null;
  activeProposalCreationTraceId = null;
}

function syncActiveProposalCreationTrace(
  trace: ProposalCreationTraceLike,
  traceId?: string | null
) {
  if (!trace) {
    clearActiveProposalCreationTrace();
    return;
  }

  activeProposalCreationTrace = trace;
  activeProposalCreationTraceId =
    traceId ??
    (typeof trace.getTraceId === "function" ? trace.getTraceId() : null) ??
    null;
}

function getReusableProposalCreationTrace(
  traceState?: ProposalCreationTraceState | null
): ProposalCreationTraceLike {
  if (!activeProposalCreationTrace) {
    return null;
  }

  const currentTraceId =
    activeProposalCreationTraceId ??
    (typeof activeProposalCreationTrace.getTraceId === "function"
      ? activeProposalCreationTrace.getTraceId()
      : null);

  if (!traceState?.traceId) {
    return currentTraceId ? null : activeProposalCreationTrace;
  }

  if (currentTraceId && currentTraceId === traceState.traceId) {
    activeProposalCreationTraceId = currentTraceId;
    return activeProposalCreationTrace;
  }

  return null;
}

function applyProposalCreationTraceContext(
  trace: ProposalCreationTraceLike,
  options: {
    branch?: ProposalCreationBranch;
    walletAddress?: `0x${string}`;
    chainId?: number | string;
    traceId?: string;
  }
) {
  if (!trace) {
    return;
  }

  addMiradorAttributes(trace, {
    "proposal.branch": options.branch,
    "wallet.address": options.walletAddress,
    "wallet.chainId": options.chainId,
    "session.id": options.traceId,
  });
}

export function isMiradorProposalCreationSiweTracingEnabled(): boolean {
  return isMiradorSiweLoginTracingEnabled();
}

export function getStoredProposalCreationTraceState(): ProposalCreationTraceState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(
      PROPOSAL_CREATION_TRACE_STORAGE_KEY
    );
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as ProposalCreationTraceState;
  } catch {
    return null;
  }
}

export function setStoredProposalCreationTraceState(
  traceState: ProposalCreationTraceState
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PROPOSAL_CREATION_TRACE_STORAGE_KEY,
      JSON.stringify(traceState)
    );
  } catch {}
}

export function clearStoredProposalCreationTraceState() {
  if (typeof window === "undefined") {
    clearActiveProposalCreationTrace();
    return;
  }

  try {
    window.sessionStorage.removeItem(PROPOSAL_CREATION_TRACE_STORAGE_KEY);
  } catch {}
  clearActiveProposalCreationTrace();
}

export function getProposalCreationTraceContext():
  | MiradorTraceContext
  | undefined {
  const storedTrace = getStoredProposalCreationTraceState();
  if (!storedTrace) {
    return undefined;
  }

  return {
    traceId: storedTrace.traceId,
    flow: storedTrace.flow,
    source: "frontend",
    branch: storedTrace.branch,
    walletAddress: storedTrace.walletAddress,
    chainId: storedTrace.chainId,
    sessionId: storedTrace.traceId,
  };
}

export function getProposalCreationTraceHeaders(): Record<string, string> {
  return getMiradorTraceHeaders(getProposalCreationTraceContext());
}

export function startOrResumeProposalCreationTrace(
  options: {
    branch?: ProposalCreationBranch;
    walletAddress?: `0x${string}`;
    chainId?: number | string;
  } = {}
): ProposalCreationTraceLike {
  if (!isMiradorProposalCreationTracingEnabled()) {
    return null;
  }

  const storedTrace = getStoredProposalCreationTraceState();
  const reusableTrace = getReusableProposalCreationTrace(storedTrace);
  if (reusableTrace) {
    applyProposalCreationTraceContext(reusableTrace, {
      traceId: storedTrace?.traceId,
      branch: options.branch ?? storedTrace?.branch,
      walletAddress: options.walletAddress ?? storedTrace?.walletAddress,
      chainId: options.chainId ?? storedTrace?.chainId,
    });
    return reusableTrace;
  }

  const trace = startMiradorTrace({
    name: PROPOSAL_CREATION_TRACE_NAME,
    flow: MIRADOR_FLOW.proposalCreation,
    autoClose: true,
    tags: getMiradorFlowTags(MIRADOR_FLOW.proposalCreation),
    context: {
      traceId: storedTrace?.traceId,
      branch: options.branch ?? storedTrace?.branch,
      walletAddress: options.walletAddress ?? storedTrace?.walletAddress,
      chainId: options.chainId ?? storedTrace?.chainId,
      sessionId: storedTrace?.traceId ?? undefined,
    },
  });
  syncActiveProposalCreationTrace(trace, storedTrace?.traceId);
  return trace;
}

export function startFreshProposalCreationTrace(
  options: {
    branch?: ProposalCreationBranch;
    walletAddress?: `0x${string}`;
    chainId?: number | string;
  } = {}
): ProposalCreationTraceLike {
  if (!isMiradorProposalCreationTracingEnabled()) {
    return null;
  }

  if (activeProposalCreationTrace) {
    void closeMiradorTrace(
      activeProposalCreationTrace,
      "proposal_creation_restarted"
    );
    clearActiveProposalCreationTrace();
  }

  clearStoredProposalCreationTraceState();

  const trace = startMiradorTrace({
    name: PROPOSAL_CREATION_TRACE_NAME,
    flow: MIRADOR_FLOW.proposalCreation,
    autoClose: true,
    tags: getMiradorFlowTags(MIRADOR_FLOW.proposalCreation),
    context: {
      branch: options.branch,
      walletAddress: options.walletAddress,
      chainId: options.chainId,
    },
  });
  syncActiveProposalCreationTrace(trace);
  return trace;
}

export async function persistProposalCreationTraceState(
  trace: ProposalCreationTraceLike,
  options: {
    branch?: ProposalCreationBranch;
    walletAddress?: `0x${string}`;
    chainId?: number | string;
    safeAddress?: `0x${string}`;
  } = {}
): Promise<ProposalCreationTraceState | null> {
  if (!trace) {
    return null;
  }

  const traceId =
    trace.getTraceId() ?? (await flushAndWaitForMiradorTraceId(trace));
  if (!traceId) {
    return null;
  }

  const storedTrace = getStoredProposalCreationTraceState();
  const traceState: ProposalCreationTraceState = {
    traceId,
    flow: MIRADOR_FLOW.proposalCreation,
    branch: options.branch ?? storedTrace?.branch,
    walletAddress: options.walletAddress ?? storedTrace?.walletAddress,
    chainId: options.chainId ?? storedTrace?.chainId,
    safeAddress: options.safeAddress ?? storedTrace?.safeAddress,
    startedAt: storedTrace?.startedAt ?? Date.now(),
  };

  setStoredProposalCreationTraceState(traceState);
  syncActiveProposalCreationTrace(trace, traceId);
  return traceState;
}

export async function markProposalCreationBranch(
  branch: ProposalCreationBranch,
  trace?: ProposalCreationTraceLike,
  options: {
    walletAddress?: `0x${string}`;
    chainId?: number | string;
    safeAddress?: `0x${string}`;
  } = {}
): Promise<ProposalCreationTraceState | null> {
  const activeTrace = trace ?? startOrResumeProposalCreationTrace(options);
  if (!activeTrace) {
    return null;
  }

  addMiradorAttributes(activeTrace, {
    "proposal.branch": branch,
  });
  flushMiradorTrace(activeTrace);

  return persistProposalCreationTraceState(activeTrace, {
    ...options,
    branch,
  });
}

export async function closeStoredProposalCreationTrace(options?: {
  reason?: string;
  eventName?: string;
  details?: Record<string, unknown> | string;
}) {
  const storedTrace = getStoredProposalCreationTraceState();
  if (!storedTrace?.traceId) {
    clearStoredProposalCreationTraceState();
    clearActiveProposalCreationTrace();
    return;
  }

  const activeTrace = getReusableProposalCreationTrace(storedTrace);

  let trace = activeTrace;
  if (!trace) {
    trace = startMiradorTrace({
      name: PROPOSAL_CREATION_TRACE_NAME,
      flow: MIRADOR_FLOW.proposalCreation,
      autoClose: true,
      autoKeepAlive: false,
      tags: getMiradorFlowTags(MIRADOR_FLOW.proposalCreation),
      context: {
        traceId: storedTrace.traceId,
        branch: storedTrace.branch,
        walletAddress: storedTrace.walletAddress,
        chainId: storedTrace.chainId,
        sessionId: storedTrace.traceId,
      },
    });
  }

  if (!trace) {
    clearStoredProposalCreationTraceState();
    clearActiveProposalCreationTrace();
    return;
  }

  if (options?.eventName) {
    addMiradorEvent(trace, options.eventName, options.details);
  }
  flushMiradorTrace(trace);
  clearStoredProposalCreationTraceState();
  clearActiveProposalCreationTrace();
  await closeMiradorTrace(trace, options?.reason);
}
