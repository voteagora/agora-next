"use client";

import { useSyncExternalStore } from "react";

export const SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY =
  "agora:safe-offchain-proposal-flow";

const SAFE_OFFCHAIN_PROPOSAL_FLOW_EVENT =
  "agora:safe-offchain-proposal-flow:change";

export const SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS = 3 * 60 * 1000;

export type SafeOffchainSigningPurpose =
  | "proposal_draft"
  | "notification_preferences"
  | "delegate_statement";

export type SafeOffchainSigningKind = "siwe" | "raw_message";

export type SafeOffchainSigningStatus =
  | "idle"
  | "pending_wallet"
  | "waiting_for_signatures"
  | "verifying"
  | "draft_creating"
  | "expired"
  | "cancelled"
  | "failed";

export type SafeOffchainSigningState = {
  purpose: SafeOffchainSigningPurpose;
  signingKind: SafeOffchainSigningKind;
  safeAddress: `0x${string}`;
  chainId: number;
  messageHash?: `0x${string}`;
  message?: string;
  startedAt?: number;
  expiresAt?: number;
  status: SafeOffchainSigningStatus;
  errorMessage?: string;
};

export type SafeSiweFlowPurpose = Extract<
  SafeOffchainSigningPurpose,
  "proposal_draft" | "notification_preferences" | "delegate_statement"
>;
export type SafeSiweFlowStatus = SafeOffchainSigningStatus;
export type SafeSiweFlowState = SafeOffchainSigningState;

export type SafeProposalOffchainFlowStatus = SafeOffchainSigningStatus;
export type SafeProposalOffchainFlowState = SafeOffchainSigningState;

type SafeOffchainSigningSubscriber = (
  state: SafeOffchainSigningState | null
) => void;

let cachedSafeOffchainSigningRawState: string | null = null;
let cachedSafeOffchainSigningState: SafeOffchainSigningState | null = null;

function normalizeStoredSafeOffchainSigningState(
  state: Partial<SafeOffchainSigningState> | null | undefined
): SafeOffchainSigningState | null {
  if (
    !state?.safeAddress ||
    typeof state.chainId !== "number" ||
    !state.status
  ) {
    return null;
  }

  return {
    purpose: state.purpose ?? "proposal_draft",
    signingKind: state.signingKind ?? "siwe",
    safeAddress: state.safeAddress,
    chainId: state.chainId,
    messageHash: state.messageHash,
    message: state.message,
    startedAt: state.startedAt,
    expiresAt: state.expiresAt,
    status: state.status,
    errorMessage: state.errorMessage,
  };
}

function emitSafeOffchainSigningState(state: SafeOffchainSigningState | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<SafeOffchainSigningState | null>(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_EVENT,
      {
        detail: state,
      }
    )
  );
}

function updateCachedSafeOffchainSigningState(params: {
  rawState: string | null;
  state: SafeOffchainSigningState | null;
}) {
  cachedSafeOffchainSigningRawState = params.rawState;
  cachedSafeOffchainSigningState = params.state;
}

export function getStoredSafeOffchainSigningState(): SafeOffchainSigningState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY
    );
    if (!rawValue) {
      updateCachedSafeOffchainSigningState({
        rawState: null,
        state: null,
      });
      return null;
    }

    if (rawValue === cachedSafeOffchainSigningRawState) {
      return cachedSafeOffchainSigningState;
    }

    const normalizedState = normalizeStoredSafeOffchainSigningState(
      JSON.parse(rawValue) as Partial<SafeOffchainSigningState> | null
    );

    updateCachedSafeOffchainSigningState({
      rawState: rawValue,
      state: normalizedState,
    });

    return normalizedState;
  } catch {
    return null;
  }
}

export function setStoredSafeOffchainSigningState(
  state: SafeOffchainSigningState
) {
  if (typeof window === "undefined") {
    return;
  }

  const serializedState = JSON.stringify(state);

  try {
    window.sessionStorage.setItem(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY,
      serializedState
    );
  } catch {}

  updateCachedSafeOffchainSigningState({
    rawState: serializedState,
    state,
  });

  emitSafeOffchainSigningState(state);
}

export function patchStoredSafeOffchainSigningState(
  patch: Partial<SafeOffchainSigningState>
) {
  const currentState = getStoredSafeOffchainSigningState();
  if (!currentState) {
    return null;
  }

  const nextState = normalizeStoredSafeOffchainSigningState({
    ...currentState,
    ...patch,
  });
  if (!nextState) {
    return null;
  }

  setStoredSafeOffchainSigningState(nextState);
  return nextState;
}

export function clearStoredSafeOffchainSigningState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY);
  } catch {}

  updateCachedSafeOffchainSigningState({
    rawState: null,
    state: null,
  });

  emitSafeOffchainSigningState(null);
}

export function subscribeToSafeOffchainSigningState(
  subscriber: SafeOffchainSigningSubscriber
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (
    event: Event & {
      detail?: SafeOffchainSigningState | null;
    }
  ) => {
    subscriber(event.detail ?? getStoredSafeOffchainSigningState());
  };

  window.addEventListener(
    SAFE_OFFCHAIN_PROPOSAL_FLOW_EVENT,
    handler as EventListener
  );

  return () => {
    window.removeEventListener(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_EVENT,
      handler as EventListener
    );
  };
}

export function useStoredSafeOffchainSigningState(params?: {
  safeAddress?: string;
  purpose?: SafeOffchainSigningPurpose;
  signingKind?: SafeOffchainSigningKind;
}) {
  return useSyncExternalStore(
    subscribeToSafeOffchainSigningState,
    () => {
      const state = getStoredSafeOffchainSigningState();
      if (!state) {
        return null;
      }

      if (
        params?.safeAddress &&
        state.safeAddress.toLowerCase() !== params.safeAddress.toLowerCase()
      ) {
        return null;
      }

      if (params?.purpose && state.purpose !== params.purpose) {
        return null;
      }

      if (params?.signingKind && state.signingKind !== params.signingKind) {
        return null;
      }

      return state;
    },
    () => null
  );
}

export function initializeSafeOffchainSigningFlow(params: {
  safeAddress: `0x${string}`;
  chainId: number;
  purpose?: SafeOffchainSigningPurpose;
  signingKind?: SafeOffchainSigningKind;
}) {
  const nextState: SafeOffchainSigningState = {
    purpose: params.purpose ?? "proposal_draft",
    signingKind: params.signingKind ?? "siwe",
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    status: "pending_wallet",
  };

  setStoredSafeOffchainSigningState(nextState);
  return nextState;
}

export function primeSafeOffchainSigningMessage(params: {
  safeAddress: `0x${string}`;
  chainId: number;
  messageHash: `0x${string}`;
  message: string;
  purpose?: SafeOffchainSigningPurpose;
  signingKind?: SafeOffchainSigningKind;
  timeoutMs?: number;
}) {
  const now = Date.now();
  const currentState = getStoredSafeOffchainSigningState();
  const nextState: SafeOffchainSigningState = {
    purpose: params.purpose ?? currentState?.purpose ?? "proposal_draft",
    signingKind: params.signingKind ?? currentState?.signingKind ?? "siwe",
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    messageHash: params.messageHash,
    message: params.message,
    startedAt: currentState?.startedAt ?? now,
    expiresAt:
      currentState?.expiresAt ??
      now + (params.timeoutMs ?? SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS),
    status: currentState?.status ?? "pending_wallet",
    errorMessage: currentState?.errorMessage,
  };

  setStoredSafeOffchainSigningState(nextState);
  return nextState;
}

export function markSafeOffchainSigningMessageCreated(params: {
  safeAddress: `0x${string}`;
  chainId: number;
  messageHash: `0x${string}`;
  message: string;
  purpose?: SafeOffchainSigningPurpose;
  signingKind?: SafeOffchainSigningKind;
  timeoutMs?: number;
}) {
  const now = Date.now();
  const currentState = getStoredSafeOffchainSigningState();
  const nextState: SafeOffchainSigningState = {
    purpose: params.purpose ?? currentState?.purpose ?? "proposal_draft",
    signingKind: params.signingKind ?? currentState?.signingKind ?? "siwe",
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    messageHash: params.messageHash,
    message: params.message,
    startedAt: now,
    expiresAt:
      now + (params.timeoutMs ?? SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS),
    status: "waiting_for_signatures",
  };

  setStoredSafeOffchainSigningState(nextState);
  return nextState;
}

export function setSafeOffchainSigningFlowStatus(
  status: SafeOffchainSigningStatus,
  errorMessage?: string
) {
  return patchStoredSafeOffchainSigningState({
    status,
    errorMessage,
  });
}

export function isSafeOffchainSigningFlowActive(
  state: SafeOffchainSigningState | null | undefined
) {
  if (!state) {
    return false;
  }

  return (
    state.status === "pending_wallet" ||
    state.status === "waiting_for_signatures" ||
    state.status === "verifying" ||
    state.status === "draft_creating"
  );
}

export function isSafeOffchainSigningFlowExpired(
  state: SafeOffchainSigningState | null | undefined
) {
  if (!state?.expiresAt) {
    return false;
  }

  return Date.now() >= state.expiresAt;
}

export function isSafeOffchainSigningFlowTerminal(
  state: SafeOffchainSigningState | null | undefined
) {
  if (!state) {
    return false;
  }

  return (
    state.status === "expired" ||
    state.status === "cancelled" ||
    state.status === "failed"
  );
}

export const getStoredSafeSiweFlowState = getStoredSafeOffchainSigningState;
export const setStoredSafeSiweFlowState = setStoredSafeOffchainSigningState;
export const patchStoredSafeSiweFlowState = patchStoredSafeOffchainSigningState;
export const clearStoredSafeSiweFlowState = clearStoredSafeOffchainSigningState;
export const subscribeToSafeSiweFlowState = subscribeToSafeOffchainSigningState;
export const initializeSafeSiweFlow = initializeSafeOffchainSigningFlow;
export const markSafeSiweMessageCreated = markSafeOffchainSigningMessageCreated;
export const setSafeSiweFlowStatus = setSafeOffchainSigningFlowStatus;
export const isSafeSiweFlowActive = isSafeOffchainSigningFlowActive;
export const isSafeSiweFlowExpired = isSafeOffchainSigningFlowExpired;
export const isSafeSiweFlowTerminal = isSafeOffchainSigningFlowTerminal;

export const getStoredSafeProposalOffchainFlowState =
  getStoredSafeOffchainSigningState;
export const setStoredSafeProposalOffchainFlowState =
  setStoredSafeOffchainSigningState;
export const patchStoredSafeProposalOffchainFlowState =
  patchStoredSafeOffchainSigningState;
export const clearStoredSafeProposalOffchainFlowState =
  clearStoredSafeOffchainSigningState;
export const subscribeToSafeProposalOffchainFlowState =
  subscribeToSafeOffchainSigningState;
export const initializeSafeProposalOffchainFlow =
  initializeSafeOffchainSigningFlow;
export const markSafeProposalOffchainMessageCreated =
  markSafeOffchainSigningMessageCreated;
export const setSafeProposalOffchainFlowStatus =
  setSafeOffchainSigningFlowStatus;
export const isSafeProposalOffchainFlowActive = isSafeOffchainSigningFlowActive;
export const isSafeProposalOffchainFlowExpired =
  isSafeOffchainSigningFlowExpired;
export const isSafeProposalOffchainFlowTerminal =
  isSafeOffchainSigningFlowTerminal;
