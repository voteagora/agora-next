import { SIWEConfig } from "connectkit";
import { SiweMessage } from "siwe";
import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";
import {
  clearStoredSiweSession,
  getStoredSiweSession,
} from "@/lib/siweSession";
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains";
import {
  closeStoredProposalCreationTrace,
  getProposalCreationTraceHeaders,
  getStoredProposalCreationTraceState,
  isMiradorProposalCreationSiweTracingEnabled,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import {
  closeStoredSiweLoginTrace,
  getSiweLoginTraceHeaders,
  getStoredSiweLoginTraceState,
  startOrResumeSiweLoginTrace,
} from "@/lib/mirador/siweLoginTrace";
import {
  addMiradorEvent,
  addMiradorSafeMsgHint,
  flushMiradorTrace,
} from "@/lib/mirador/webTrace";
import { getCanonicalSafeMessageHash } from "@/lib/safeMessages";
import {
  clearStoredSafeSiweFlowState,
  getStoredSafeSiweFlowState,
  isSafeSiweFlowActive,
  isSafeSiweFlowExpired,
  isSafeSiweFlowTerminal,
  markSafeSiweMessageCreated,
  setSafeSiweFlowStatus,
} from "@/lib/safeOffchainFlow";

const API_AUTH_PREFIX = "/api/v1/auth";

const LOCAL_STORAGE_JWT_KEY = LOCAL_STORAGE_SIWE_JWT_KEY;
export const AGORA_SIGN_IN_MESSAGE = "Sign in to Agora with Ethereum";

const SIWE_ENABLED = process.env.NEXT_PUBLIC_SIWE_ENABLED === "true";
const SAFE_DEBUG_LOGS = process.env.NEXT_PUBLIC_SAFE_DEBUG_LOGS === "true";
let activeSafeSiweNonceCache: {
  safeAddress: `0x${string}`;
  chainId: number;
  nonce: string;
} | null = null;

/* There's currently nothing stored on the backend to maintain session state.
// All session state is stateless and stored in the JWT issued by the server.
// Address, nonce, and chainId are all stored in the JWT, along with a particular
// time to live/expiry.
//
// For signOut, the client should remove JWT from storage as applicable, and is otherwise
// a no-op (pending AGORA-2015, or potential JWT-token tracking on our backend DB).
//
// JWT tokens for SIWE should therefore be issued with a short expiry time.
*/

function getActiveSafeSiweFlowState(params?: {
  safeAddress?: string;
  chainId?: number;
}) {
  const flowState = getStoredSafeSiweFlowState();
  if (!flowState) {
    return null;
  }

  if (
    params?.safeAddress &&
    flowState.safeAddress.toLowerCase() !== params.safeAddress.toLowerCase()
  ) {
    return null;
  }

  if (
    typeof params?.chainId === "number" &&
    flowState.chainId !== params.chainId
  ) {
    return null;
  }

  if (flowState.signingKind !== "siwe") {
    return null;
  }

  return flowState;
}

function logSafeClientDebug(event: Record<string, unknown>) {
  if (!SAFE_DEBUG_LOGS) {
    return;
  }

  console.info("[safe-debug]", event);
}

function clearActiveSafeSiweNonceCache() {
  activeSafeSiweNonceCache = null;
}

function getActiveMiradorSiweLoginState(params?: {
  walletAddress?: string;
  chainId?: number;
}) {
  const traceState = getStoredSiweLoginTraceState();
  if (!traceState) {
    return null;
  }

  if (
    params?.walletAddress &&
    traceState.walletAddress &&
    traceState.walletAddress.toLowerCase() !==
      params.walletAddress.toLowerCase()
  ) {
    return null;
  }

  if (
    typeof params?.chainId === "number" &&
    typeof traceState.chainId === "number" &&
    traceState.chainId !== params.chainId
  ) {
    return null;
  }

  return traceState;
}

function getActiveProposalCreationTraceState(params?: {
  walletAddress?: string;
  chainId?: number;
}) {
  const traceState = getStoredProposalCreationTraceState();
  if (!traceState || traceState.branch !== "safe_offchain_draft") {
    return null;
  }

  if (
    params?.walletAddress &&
    traceState.walletAddress &&
    traceState.walletAddress.toLowerCase() !==
      params.walletAddress.toLowerCase()
  ) {
    return null;
  }

  if (
    typeof params?.chainId === "number" &&
    typeof traceState.chainId === "number" &&
    traceState.chainId !== params.chainId
  ) {
    return null;
  }

  return traceState;
}

function shouldPreferProposalCreationSiweTrace(params: {
  walletAddress?: `0x${string}`;
  chainId?: number;
  safeSiweFlowState?: ReturnType<typeof getActiveSafeSiweFlowState>;
  requirePendingNonce?: boolean;
}) {
  if (!isMiradorProposalCreationSiweTracingEnabled()) {
    return false;
  }

  const proposalTraceState = getActiveProposalCreationTraceState({
    walletAddress: params.walletAddress,
    chainId: params.chainId,
  });
  if (
    !proposalTraceState ||
    params.safeSiweFlowState?.purpose !== "proposal_draft"
  ) {
    return false;
  }

  if (!params.requirePendingNonce) {
    return true;
  }

  return (
    isSafeSiweFlowActive(params.safeSiweFlowState) &&
    params.safeSiweFlowState.status === "pending_wallet" &&
    !params.safeSiweFlowState.messageHash
  );
}

function getMiradorSiweTrace(params: {
  preferProposalTrace?: boolean;
  walletAddress?: `0x${string}`;
  chainId?: number;
}) {
  if (params.preferProposalTrace) {
    return {
      kind: "proposal" as const,
      trace: startOrResumeProposalCreationTrace({
        walletAddress: params.walletAddress,
        chainId: params.chainId,
      }),
      headers: getProposalCreationTraceHeaders(),
      purpose: "proposal_draft" as const,
    };
  }

  const surfaceTraceState = getActiveMiradorSiweLoginState({
    walletAddress: params.walletAddress,
    chainId: params.chainId,
  });
  if (!surfaceTraceState) {
    return {
      kind: "none" as const,
      trace: null,
      headers: undefined,
      purpose: undefined,
    };
  }

  return {
    kind: "surface" as const,
    trace: startOrResumeSiweLoginTrace({
      purpose: surfaceTraceState.purpose,
      walletAddress: params.walletAddress ?? surfaceTraceState.walletAddress,
      chainId: params.chainId ?? surfaceTraceState.chainId,
    }),
    headers: getSiweLoginTraceHeaders(),
    purpose: surfaceTraceState.purpose,
  };
}

async function closeMiradorSiweTrace(params: {
  traceKind: "proposal" | "surface" | "none";
  eventName: string;
  details?: Record<string, unknown> | string;
  reason: string;
}) {
  if (params.traceKind === "proposal") {
    await closeStoredProposalCreationTrace({
      eventName: params.eventName,
      details: params.details,
      reason: params.reason,
    });
  }

  if (params.traceKind === "surface") {
    await closeStoredSiweLoginTrace({
      eventName: params.eventName,
      details: params.details,
      reason: params.reason,
    });
  }
}

function getSafeMessageHintDetails(params: {
  traceKind: "proposal" | "surface" | "none";
  tracePurpose?:
    | "proposal_draft"
    | "notification_preferences"
    | "delegate_statement";
}) {
  if (
    params.traceKind === "proposal" ||
    params.tracePurpose === "proposal_draft"
  ) {
    return "Create proposal SIWE";
  }

  if (params.tracePurpose === "notification_preferences") {
    return "Notification preferences SIWE";
  }

  if (params.tracePurpose === "delegate_statement") {
    return "Delegate statement SIWE";
  }

  return undefined;
}

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () => {
    const safeSiweFlowState = getActiveSafeSiweFlowState();
    const shouldTraceSafeProposalNonce = shouldPreferProposalCreationSiweTrace({
      walletAddress: safeSiweFlowState?.safeAddress,
      chainId: safeSiweFlowState?.chainId,
      safeSiweFlowState,
      requirePendingNonce: true,
    });
    const shouldReuseCachedSafeNonce =
      !!safeSiweFlowState &&
      isSafeSiweFlowActive(safeSiweFlowState) &&
      !!safeSiweFlowState.messageHash &&
      !!activeSafeSiweNonceCache &&
      activeSafeSiweNonceCache.safeAddress.toLowerCase() ===
        safeSiweFlowState.safeAddress.toLowerCase() &&
      activeSafeSiweNonceCache.chainId === safeSiweFlowState.chainId;

    if (
      !safeSiweFlowState ||
      !isSafeSiweFlowActive(safeSiweFlowState) ||
      (activeSafeSiweNonceCache &&
        (activeSafeSiweNonceCache.safeAddress.toLowerCase() !==
          safeSiweFlowState.safeAddress.toLowerCase() ||
          activeSafeSiweNonceCache.chainId !== safeSiweFlowState.chainId))
    ) {
      clearActiveSafeSiweNonceCache();
    }

    if (shouldReuseCachedSafeNonce) {
      return activeSafeSiweNonceCache!.nonce;
    }

    const activeTrace = getMiradorSiweTrace({
      preferProposalTrace: shouldTraceSafeProposalNonce,
      walletAddress: safeSiweFlowState?.safeAddress,
      chainId: safeSiweFlowState?.chainId,
    });
    const trace = activeTrace.trace;

    addMiradorEvent(trace, "siwe_nonce_requested");
    flushMiradorTrace(trace);

    const res = await fetch(`${API_AUTH_PREFIX}/nonce`, {
      headers: activeTrace.headers,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      addMiradorEvent(trace, "siwe_nonce_failed_client", {
        status: res.status,
      });
      flushMiradorTrace(trace);
      await closeMiradorSiweTrace({
        traceKind: activeTrace.kind,
        eventName: "siwe_nonce_failed_client_closed",
        details: { status: res.status },
        reason: "siwe_nonce_failed",
      });
      throw new Error(`Failed to fetch SIWE nonce (${res.status})`);
    }

    if (typeof data?.nonce !== "string" || data.nonce.length === 0) {
      addMiradorEvent(trace, "siwe_nonce_failed_client", {
        reason: "missing_nonce",
      });
      flushMiradorTrace(trace);
      await closeMiradorSiweTrace({
        traceKind: activeTrace.kind,
        eventName: "siwe_nonce_failed_client_closed",
        details: { reason: "missing_nonce" },
        reason: "siwe_nonce_failed",
      });
      throw new Error("SIWE nonce response was missing a nonce");
    }

    if (
      safeSiweFlowState?.safeAddress &&
      typeof safeSiweFlowState.chainId === "number"
    ) {
      activeSafeSiweNonceCache = {
        safeAddress: safeSiweFlowState.safeAddress,
        chainId: safeSiweFlowState.chainId,
        nonce: data.nonce,
      };
    }

    addMiradorEvent(trace, "siwe_nonce_received");
    flushMiradorTrace(trace);
    return data.nonce;
  },
  createMessage: async ({ nonce, address, chainId }) => {
    const message = new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
      statement: AGORA_SIGN_IN_MESSAGE,
      address,
      chainId,
      nonce,
    }).prepareMessage();

    const safeSiweFlowState = getActiveSafeSiweFlowState({
      safeAddress: address,
      chainId,
    });
    const shouldTraceProposal = shouldPreferProposalCreationSiweTrace({
      walletAddress: address as `0x${string}`,
      chainId,
      safeSiweFlowState,
    });
    const activeTrace = getMiradorSiweTrace({
      preferProposalTrace: shouldTraceProposal,
      walletAddress: address as `0x${string}`,
      chainId,
    });
    const trace = activeTrace.trace;
    const shouldPersistSafeMessageState =
      safeSiweFlowState?.status === "pending_wallet" &&
      isSafeSiweFlowActive(safeSiweFlowState);

    if (shouldPersistSafeMessageState) {
      addMiradorEvent(trace, "siwe_nonce_available", {
        source:
          activeSafeSiweNonceCache?.nonce === nonce
            ? "active_flow_cache"
            : "prefetched_query_cache",
      });
    }
    addMiradorEvent(trace, "siwe_message_created");

    if (shouldPersistSafeMessageState) {
      try {
        const safeMessageHash = await getCanonicalSafeMessageHash({
          safeAddress: address as `0x${string}`,
          chainId,
          message,
        });
        const miradorChain = getMiradorChainNameFromChainId(chainId);

        if (trace && miradorChain) {
          addMiradorSafeMsgHint(
            trace,
            safeMessageHash,
            miradorChain,
            getSafeMessageHintDetails({
              traceKind: activeTrace.kind,
              tracePurpose: activeTrace.purpose,
            })
          );
        }
        markSafeSiweMessageCreated({
          purpose: safeSiweFlowState.purpose,
          safeAddress: address as `0x${string}`,
          chainId,
          messageHash: safeMessageHash,
          message,
        });
        logSafeClientDebug({
          event: "safe_siwe_message_created",
          purpose: safeSiweFlowState.purpose,
          safeAddress: address,
          chainId,
          messageHash: safeMessageHash,
          messageLength: message.length,
          messagePreview: message.slice(0, 120),
        });
      } catch (error) {
        addMiradorEvent(trace, "safe_message_hash_failed", {
          reason: error instanceof Error ? error.message : "unknown",
        });
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to compute Safe message hash";
        setSafeSiweFlowStatus("failed", errorMessage);
        await closeMiradorSiweTrace({
          traceKind: activeTrace.kind,
          eventName: "safe_message_hash_failed_closed",
          details: {
            reason: error instanceof Error ? error.message : "unknown",
          },
          reason: "safe_message_hash_failed",
        });
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    }

    flushMiradorTrace(trace);
    return message;
  },
  verifyMessage: async ({ message, signature }) => {
    const siweMessage = new SiweMessage(message);
    const safeSiweFlowState = getActiveSafeSiweFlowState({
      safeAddress: siweMessage.address,
      chainId: siweMessage.chainId,
    });
    const shouldTraceProposal = shouldPreferProposalCreationSiweTrace({
      walletAddress: siweMessage.address as `0x${string}`,
      chainId: siweMessage.chainId,
      safeSiweFlowState,
    });
    const activeTrace = getMiradorSiweTrace({
      preferProposalTrace: shouldTraceProposal,
      walletAddress: siweMessage.address as `0x${string}`,
      chainId: siweMessage.chainId,
    });
    const trace = activeTrace.trace;

    try {
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "awaiting_response");
    } catch {}
    if (
      safeSiweFlowState &&
      isSafeSiweFlowActive(safeSiweFlowState) &&
      safeSiweFlowState.messageHash
    ) {
      setSafeSiweFlowStatus("verifying");
    }
    addMiradorEvent(trace, "siwe_verify_requested");
    flushMiradorTrace(trace);
    const res = await fetch(`${API_AUTH_PREFIX}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(activeTrace.headers ?? {}),
      },
      body: JSON.stringify({ message, signature }),
    });
    if (!res.ok) {
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      } catch {}
      addMiradorEvent(trace, "siwe_verify_failed_client", {
        status: res.status,
      });
      flushMiradorTrace(trace);
      if (safeSiweFlowState) {
        setSafeSiweFlowStatus("failed", `Verification failed (${res.status})`);
      }
      await closeMiradorSiweTrace({
        traceKind: activeTrace.kind,
        eventName: "siwe_verify_failed_client_closed",
        details: { status: res.status },
        reason: "siwe_verify_failed",
      });
      return false;
    }
    try {
      const token = await res.json();
      if (!token || !token.access_token) {
        try {
          localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
        } catch {}
        addMiradorEvent(trace, "siwe_verify_failed_client", {
          reason: "missing_token",
        });
        flushMiradorTrace(trace);
        if (safeSiweFlowState) {
          setSafeSiweFlowStatus("failed", "Verification returned no token");
        }
        await closeMiradorSiweTrace({
          traceKind: activeTrace.kind,
          eventName: "siwe_verify_failed_client_closed",
          details: { reason: "missing_token" },
          reason: "siwe_verify_failed",
        });
        return false;
      }

      if (
        safeSiweFlowState &&
        (isSafeSiweFlowTerminal(safeSiweFlowState) ||
          isSafeSiweFlowExpired(safeSiweFlowState))
      ) {
        try {
          localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
        } catch {}
        addMiradorEvent(trace, "siwe_verify_ignored_after_timeout");
        flushMiradorTrace(trace);
        clearActiveSafeSiweNonceCache();
        clearStoredSafeSiweFlowState();
        await closeMiradorSiweTrace({
          traceKind: activeTrace.kind,
          eventName: "siwe_verify_ignored_after_timeout_closed",
          reason: "siwe_verify_expired",
        });
        return false;
      }

      if (safeSiweFlowState) {
        if (!safeSiweFlowState.messageHash) {
          try {
            localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
          } catch {}
          addMiradorEvent(trace, "siwe_verify_ignored_without_message_hash");
          flushMiradorTrace(trace);
          await closeMiradorSiweTrace({
            traceKind: activeTrace.kind,
            eventName: "siwe_verify_ignored_without_message_hash_closed",
            reason: "siwe_verify_failed",
          });
          return false;
        }

        try {
          const safeMessageHash = await getCanonicalSafeMessageHash({
            safeAddress: safeSiweFlowState.safeAddress,
            chainId: safeSiweFlowState.chainId,
            message,
          });

          if (
            safeMessageHash.toLowerCase() !==
            safeSiweFlowState.messageHash.toLowerCase()
          ) {
            try {
              localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
            } catch {}
            addMiradorEvent(trace, "siwe_verify_ignored_stale_safe_message", {
              expectedMessageHash: safeSiweFlowState.messageHash,
              receivedMessageHash: safeMessageHash,
            });
            flushMiradorTrace(trace);
            await closeMiradorSiweTrace({
              traceKind: activeTrace.kind,
              eventName: "siwe_verify_ignored_stale_safe_message_closed",
              details: {
                expectedMessageHash: safeSiweFlowState.messageHash,
                receivedMessageHash: safeMessageHash,
              },
              reason: "siwe_verify_failed",
            });
            return false;
          }
        } catch (error) {
          try {
            localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
          } catch {}
          addMiradorEvent(trace, "siwe_verify_safe_message_hash_failed", {
            reason: error instanceof Error ? error.message : "unknown",
          });
          flushMiradorTrace(trace);
          await closeMiradorSiweTrace({
            traceKind: activeTrace.kind,
            eventName: "siwe_verify_safe_message_hash_failed_closed",
            details: {
              reason: error instanceof Error ? error.message : "unknown",
            },
            reason: "siwe_verify_failed",
          });
          return false;
        }
      }

      localStorage.setItem(LOCAL_STORAGE_JWT_KEY, JSON.stringify(token));
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "signed");
      } catch {}
      clearActiveSafeSiweNonceCache();
      addMiradorEvent(trace, "siwe_verify_succeeded_client");
      flushMiradorTrace(trace);
      if (activeTrace.kind === "surface") {
        await closeMiradorSiweTrace({
          traceKind: activeTrace.kind,
          eventName: "siwe_login_completed",
          reason: "siwe_login_completed",
        });
      }
      return true;
    } catch {
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      } catch {}
      addMiradorEvent(trace, "siwe_verify_failed_client", {
        reason: "invalid_json",
      });
      flushMiradorTrace(trace);
      if (safeSiweFlowState) {
        setSafeSiweFlowStatus("failed", "Verification returned invalid JSON");
      }
      await closeMiradorSiweTrace({
        traceKind: activeTrace.kind,
        eventName: "siwe_verify_failed_client_closed",
        details: { reason: "invalid_json" },
        reason: "siwe_verify_failed",
      });
      return false;
    }
  },
  getSession: async () => {
    const session = getStoredSiweSession();
    if (!session) return null;
    return { address: session.address, chainId: session.chainId };
  },
  signOut: () => {
    // remove SIWE session data from local storage
    clearActiveSafeSiweNonceCache();
    clearStoredSiweSession();
    return Promise.resolve(true);
  },
  enabled: SIWE_ENABLED,
};
