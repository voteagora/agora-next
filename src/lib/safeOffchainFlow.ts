"use client";

export const SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY =
  "agora:safe-offchain-proposal-flow";

const SAFE_OFFCHAIN_PROPOSAL_FLOW_EVENT =
  "agora:safe-offchain-proposal-flow:change";

export const SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS = 3 * 60 * 1000;

export type SafeProposalOffchainFlowStatus =
  | "idle"
  | "pending_wallet"
  | "waiting_for_signatures"
  | "verifying"
  | "draft_creating"
  | "expired"
  | "cancelled"
  | "failed";

export type SafeProposalOffchainFlowState = {
  safeAddress: `0x${string}`;
  chainId: number;
  messageHash?: `0x${string}`;
  message?: string;
  startedAt?: number;
  expiresAt?: number;
  status: SafeProposalOffchainFlowStatus;
  errorMessage?: string;
};

type SafeProposalOffchainFlowSubscriber = (
  state: SafeProposalOffchainFlowState | null
) => void;

function emitSafeProposalOffchainFlowState(
  state: SafeProposalOffchainFlowState | null
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<SafeProposalOffchainFlowState | null>(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_EVENT,
      {
        detail: state,
      }
    )
  );
}

export function getStoredSafeProposalOffchainFlowState():
  | SafeProposalOffchainFlowState
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY
    );
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as SafeProposalOffchainFlowState;
  } catch {
    return null;
  }
}

export function setStoredSafeProposalOffchainFlowState(
  state: SafeProposalOffchainFlowState
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {}

  emitSafeProposalOffchainFlowState(state);
}

export function patchStoredSafeProposalOffchainFlowState(
  patch: Partial<SafeProposalOffchainFlowState>
) {
  const currentState = getStoredSafeProposalOffchainFlowState();
  if (!currentState) {
    return null;
  }

  const nextState = {
    ...currentState,
    ...patch,
  };

  setStoredSafeProposalOffchainFlowState(nextState);
  return nextState;
}

export function clearStoredSafeProposalOffchainFlowState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(SAFE_OFFCHAIN_PROPOSAL_FLOW_STORAGE_KEY);
  } catch {}

  emitSafeProposalOffchainFlowState(null);
}

export function subscribeToSafeProposalOffchainFlowState(
  subscriber: SafeProposalOffchainFlowSubscriber
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (
    event: Event & {
      detail?: SafeProposalOffchainFlowState | null;
    }
  ) => {
    subscriber(event.detail ?? getStoredSafeProposalOffchainFlowState());
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

export function initializeSafeProposalOffchainFlow(params: {
  safeAddress: `0x${string}`;
  chainId: number;
}) {
  const nextState: SafeProposalOffchainFlowState = {
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    status: "pending_wallet",
  };

  setStoredSafeProposalOffchainFlowState(nextState);
  return nextState;
}

export function markSafeProposalOffchainMessageCreated(params: {
  safeAddress: `0x${string}`;
  chainId: number;
  messageHash: `0x${string}`;
  message: string;
  timeoutMs?: number;
}) {
  const now = Date.now();
  const nextState: SafeProposalOffchainFlowState = {
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    messageHash: params.messageHash,
    message: params.message,
    startedAt: now,
    expiresAt: now + (params.timeoutMs ?? SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS),
    status: "waiting_for_signatures",
  };

  setStoredSafeProposalOffchainFlowState(nextState);
  return nextState;
}

export function setSafeProposalOffchainFlowStatus(
  status: SafeProposalOffchainFlowStatus,
  errorMessage?: string
) {
  return patchStoredSafeProposalOffchainFlowState({
    status,
    errorMessage,
  });
}

export function isSafeProposalOffchainFlowActive(
  state: SafeProposalOffchainFlowState | null | undefined
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

export function isSafeProposalOffchainFlowExpired(
  state: SafeProposalOffchainFlowState | null | undefined
) {
  if (!state?.expiresAt) {
    return false;
  }

  return Date.now() >= state.expiresAt;
}
