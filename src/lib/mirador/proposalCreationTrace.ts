"use client";

import Tenant from "@/lib/tenant/tenant";
import { UIMiradorConfig } from "@/lib/tenant/tenantUI";

import {
  MIRADOR_FLOW,
  PROPOSAL_CREATION_TRACE_NAME,
  PROPOSAL_CREATION_TRACE_STORAGE_KEY,
} from "./constants";
import { getMiradorTraceHeaders } from "./headers";
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

type ProposalCreationTraceLike = ReturnType<typeof startMiradorTrace>;

function getMiradorConfig(): UIMiradorConfig | null {
  const toggle = Tenant.current().ui.toggle("mirador");
  if (!toggle?.enabled) {
    return null;
  }

  return (toggle.config as UIMiradorConfig | undefined) ?? null;
}

export function isMiradorProposalCreationEnabled(): boolean {
  return getMiradorConfig()?.proposalCreation === true;
}

export function isMiradorProposalCreationSiweEnabled(): boolean {
  return getMiradorConfig()?.proposalCreationSiwe === true;
}

export function getStoredProposalCreationTraceState():
  | ProposalCreationTraceState
  | null {
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
    return;
  }

  try {
    window.sessionStorage.removeItem(PROPOSAL_CREATION_TRACE_STORAGE_KEY);
  } catch {}
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
  if (!isMiradorProposalCreationEnabled()) {
    return null;
  }

  const storedTrace = getStoredProposalCreationTraceState();
  return startMiradorTrace({
    name: PROPOSAL_CREATION_TRACE_NAME,
    flow: MIRADOR_FLOW.proposalCreation,
    autoClose: true,
    context: {
      traceId: storedTrace?.traceId,
      branch: options.branch ?? storedTrace?.branch,
      walletAddress: options.walletAddress ?? storedTrace?.walletAddress,
      chainId: options.chainId ?? storedTrace?.chainId,
      sessionId: storedTrace?.traceId ?? undefined,
    },
  });
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
    return;
  }

  const trace = startMiradorTrace({
    name: PROPOSAL_CREATION_TRACE_NAME,
    flow: MIRADOR_FLOW.proposalCreation,
    autoClose: true,
    context: {
      traceId: storedTrace.traceId,
      branch: storedTrace.branch,
      walletAddress: storedTrace.walletAddress,
      chainId: storedTrace.chainId,
      sessionId: storedTrace.traceId,
    },
  });
  if (!trace) {
    clearStoredProposalCreationTraceState();
    return;
  }

  if (options?.eventName) {
    addMiradorEvent(trace, options.eventName, options.details);
  }
  flushMiradorTrace(trace);
  await closeMiradorTrace(trace, options?.reason);
  clearStoredProposalCreationTraceState();
}
