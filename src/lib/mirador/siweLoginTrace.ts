"use client";

import type { SafeOffchainSigningPurpose } from "@/lib/safeOffchainFlow";

import { isMiradorSiweTracingEnabled } from "./config";
import {
  MIRADOR_FLOW,
  MIRADOR_SIWE_LOGIN_TRACE_STORAGE_KEY,
} from "./constants";
import { getMiradorTraceHeaders } from "./headers";
import { getMiradorSiweLoginTags } from "./tags";
import type { MiradorTraceContext } from "./types";
import {
  addMiradorAttributes,
  addMiradorEvent,
  closeMiradorTrace,
  flushAndWaitForMiradorTraceId,
  flushMiradorTrace,
  startMiradorTrace,
} from "./webTrace";

export type MiradorSiweLoginPurpose = Extract<
  SafeOffchainSigningPurpose,
  "proposal_draft" | "notification_preferences" | "delegate_statement"
>;

type SiweLoginFlow =
  | typeof MIRADOR_FLOW.proposalCreation
  | typeof MIRADOR_FLOW.notificationPreferences
  | typeof MIRADOR_FLOW.delegateStatement;

type MiradorSiweLoginTraceState = {
  traceId: string;
  purpose: MiradorSiweLoginPurpose;
  flow: SiweLoginFlow;
  walletAddress?: `0x${string}`;
  chainId?: number | string;
  startedAt: number;
};

type SiweLoginTraceLike = ReturnType<typeof startMiradorTrace>;

let activeSiweLoginTrace: SiweLoginTraceLike = null;
let activeSiweLoginTraceId: string | null = null;

function clearActiveSiweLoginTrace() {
  activeSiweLoginTrace = null;
  activeSiweLoginTraceId = null;
}

function syncActiveSiweLoginTrace(
  trace: SiweLoginTraceLike,
  traceId?: string | null
) {
  if (!trace) {
    clearActiveSiweLoginTrace();
    return;
  }

  activeSiweLoginTrace = trace;
  activeSiweLoginTraceId =
    traceId ??
    (typeof trace.getTraceId === "function" ? trace.getTraceId() : null) ??
    null;
}

export function shouldTrackMiradorSiweLogin(
  purpose: SafeOffchainSigningPurpose
): purpose is MiradorSiweLoginPurpose {
  return (
    purpose === "proposal_draft" ||
    purpose === "notification_preferences" || purpose === "delegate_statement"
  );
}

export function getMiradorFlowFromSiweLoginPurpose(
  purpose: MiradorSiweLoginPurpose
): SiweLoginFlow {
  if (purpose === "proposal_draft") {
    return MIRADOR_FLOW.proposalCreation;
  }

  return purpose === "notification_preferences"
    ? MIRADOR_FLOW.notificationPreferences
    : MIRADOR_FLOW.delegateStatement;
}

function getMiradorSiweLoginTraceName(purpose: MiradorSiweLoginPurpose) {
  return `${getMiradorFlowFromSiweLoginPurpose(purpose)}_siwe_login`;
}

function getReusableSiweLoginTrace(
  traceState?: MiradorSiweLoginTraceState | null
): SiweLoginTraceLike {
  if (!activeSiweLoginTrace) {
    return null;
  }

  const currentTraceId =
    activeSiweLoginTraceId ??
    (typeof activeSiweLoginTrace.getTraceId === "function"
      ? activeSiweLoginTrace.getTraceId()
      : null);

  if (!traceState?.traceId) {
    return currentTraceId ? null : activeSiweLoginTrace;
  }

  if (currentTraceId && currentTraceId === traceState.traceId) {
    activeSiweLoginTraceId = currentTraceId;
    return activeSiweLoginTrace;
  }

  return null;
}

function applySiweLoginTraceContext(
  trace: SiweLoginTraceLike,
  options: {
    purpose: MiradorSiweLoginPurpose;
    walletAddress?: `0x${string}`;
    chainId?: number | string;
    traceId?: string;
  }
) {
  if (!trace) {
    return;
  }

  addMiradorAttributes(trace, {
    "auth.kind": "siwe",
    "auth.purpose": options.purpose,
    "wallet.address": options.walletAddress,
    "wallet.chainId": options.chainId,
    "session.id": options.traceId,
  });
}

export function getStoredSiweLoginTraceState(): MiradorSiweLoginTraceState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(
      MIRADOR_SIWE_LOGIN_TRACE_STORAGE_KEY
    );
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as MiradorSiweLoginTraceState;
  } catch {
    return null;
  }
}

export function setStoredSiweLoginTraceState(
  traceState: MiradorSiweLoginTraceState
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      MIRADOR_SIWE_LOGIN_TRACE_STORAGE_KEY,
      JSON.stringify(traceState)
    );
  } catch {}
}

export function clearStoredSiweLoginTraceState() {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(MIRADOR_SIWE_LOGIN_TRACE_STORAGE_KEY);
    } catch {}
  }

  clearActiveSiweLoginTrace();
}

export function getSiweLoginTraceContext():
  | MiradorTraceContext
  | undefined {
  const storedTrace = getStoredSiweLoginTraceState();
  if (!storedTrace) {
    return undefined;
  }

  return {
    traceId: storedTrace.traceId,
    flow: storedTrace.flow,
    source: "frontend",
    walletAddress: storedTrace.walletAddress,
    chainId: storedTrace.chainId,
    sessionId: storedTrace.traceId,
  };
}

export function getSiweLoginTraceHeaders(): Record<string, string> {
  return getMiradorTraceHeaders(getSiweLoginTraceContext());
}

export function startOrResumeSiweLoginTrace(options: {
  purpose: MiradorSiweLoginPurpose;
  walletAddress?: `0x${string}`;
  chainId?: number | string;
}): SiweLoginTraceLike {
  if (!isMiradorSiweTracingEnabled()) {
    return null;
  }

  const storedTrace = getStoredSiweLoginTraceState();
  const matchingStoredTrace =
    storedTrace?.purpose === options.purpose ? storedTrace : null;
  const reusableTrace = getReusableSiweLoginTrace(matchingStoredTrace);
  if (reusableTrace) {
    applySiweLoginTraceContext(reusableTrace, {
      purpose: options.purpose,
      traceId: matchingStoredTrace?.traceId,
      walletAddress:
        options.walletAddress ?? matchingStoredTrace?.walletAddress,
      chainId: options.chainId ?? matchingStoredTrace?.chainId,
    });
    return reusableTrace;
  }

  const flow = getMiradorFlowFromSiweLoginPurpose(options.purpose);
  const trace = startMiradorTrace({
    name: getMiradorSiweLoginTraceName(options.purpose),
    flow,
    autoClose: true,
    context: {
      traceId: matchingStoredTrace?.traceId,
      walletAddress:
        options.walletAddress ?? matchingStoredTrace?.walletAddress,
      chainId: options.chainId ?? matchingStoredTrace?.chainId,
      sessionId: matchingStoredTrace?.traceId ?? undefined,
    },
    tags: getMiradorSiweLoginTags(flow),
    attributes: {
      "auth.kind": "siwe",
      "auth.purpose": options.purpose,
    },
  });
  syncActiveSiweLoginTrace(trace, matchingStoredTrace?.traceId);
  return trace;
}

export function startFreshSiweLoginTrace(options: {
  purpose: MiradorSiweLoginPurpose;
  walletAddress?: `0x${string}`;
  chainId?: number | string;
}): SiweLoginTraceLike {
  if (!isMiradorSiweTracingEnabled()) {
    return null;
  }

  if (activeSiweLoginTrace) {
    void closeMiradorTrace(activeSiweLoginTrace, "siwe_login_restarted");
    clearActiveSiweLoginTrace();
  }

  clearStoredSiweLoginTraceState();

  const flow = getMiradorFlowFromSiweLoginPurpose(options.purpose);
  const trace = startMiradorTrace({
    name: getMiradorSiweLoginTraceName(options.purpose),
    flow,
    autoClose: true,
    context: {
      walletAddress: options.walletAddress,
      chainId: options.chainId,
    },
    tags: getMiradorSiweLoginTags(flow),
    attributes: {
      "auth.kind": "siwe",
      "auth.purpose": options.purpose,
    },
  });
  syncActiveSiweLoginTrace(trace);
  return trace;
}

export async function persistSiweLoginTraceState(
  trace: SiweLoginTraceLike,
  options: {
    purpose: MiradorSiweLoginPurpose;
    walletAddress?: `0x${string}`;
    chainId?: number | string;
  }
): Promise<MiradorSiweLoginTraceState | null> {
  if (!trace) {
    return null;
  }

  const traceId =
    trace.getTraceId() ?? (await flushAndWaitForMiradorTraceId(trace));
  if (!traceId) {
    return null;
  }

  const storedTrace = getStoredSiweLoginTraceState();
  const traceState: MiradorSiweLoginTraceState = {
    traceId,
    purpose: options.purpose,
    flow: getMiradorFlowFromSiweLoginPurpose(options.purpose),
    walletAddress: options.walletAddress ?? storedTrace?.walletAddress,
    chainId: options.chainId ?? storedTrace?.chainId,
    startedAt: storedTrace?.startedAt ?? Date.now(),
  };

  setStoredSiweLoginTraceState(traceState);
  syncActiveSiweLoginTrace(trace, traceId);
  return traceState;
}

export async function prepareFreshSiweLoginTrace(options: {
  purpose: MiradorSiweLoginPurpose;
  walletAddress?: `0x${string}`;
  chainId?: number | string;
}) {
  const trace = startFreshSiweLoginTrace(options);
  return persistSiweLoginTraceState(trace, options);
}

export async function closeStoredSiweLoginTrace(options?: {
  reason?: string;
  eventName?: string;
  details?: Record<string, unknown> | string;
}) {
  const storedTrace = getStoredSiweLoginTraceState();
  if (!storedTrace?.traceId) {
    clearStoredSiweLoginTraceState();
    clearActiveSiweLoginTrace();
    return;
  }

  const activeTrace = getReusableSiweLoginTrace(storedTrace);
  const flow = getMiradorFlowFromSiweLoginPurpose(storedTrace.purpose);

  let trace = activeTrace;
  if (!trace) {
    trace = startMiradorTrace({
      name: getMiradorSiweLoginTraceName(storedTrace.purpose),
      flow,
      autoClose: true,
      autoKeepAlive: false,
      context: {
        traceId: storedTrace.traceId,
        walletAddress: storedTrace.walletAddress,
        chainId: storedTrace.chainId,
        sessionId: storedTrace.traceId,
      },
      tags: getMiradorSiweLoginTags(flow),
      attributes: {
        "auth.kind": "siwe",
        "auth.purpose": storedTrace.purpose,
      },
    });
  }

  if (!trace) {
    clearStoredSiweLoginTraceState();
    clearActiveSiweLoginTrace();
    return;
  }

  if (options?.eventName) {
    addMiradorEvent(trace, options.eventName, options.details);
  }
  flushMiradorTrace(trace);
  await closeMiradorTrace(trace, options?.reason);

  clearStoredSiweLoginTraceState();
  clearActiveSiweLoginTrace();
}
