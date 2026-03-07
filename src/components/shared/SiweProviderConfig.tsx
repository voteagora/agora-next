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
  isMiradorProposalCreationSiweEnabled,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import {
  addMiradorEvent,
  addMiradorSafeMsgHint,
  flushMiradorTrace,
} from "@/lib/mirador/webTrace";
import { getCanonicalSafeMessageHash } from "@/lib/safeMessages";
import {
  clearStoredSafeProposalOffchainFlowState,
  getStoredSafeProposalOffchainFlowState,
  isSafeProposalOffchainFlowExpired,
  markSafeProposalOffchainMessageCreated,
  setSafeProposalOffchainFlowStatus,
} from "@/lib/safeOffchainFlow";

const API_AUTH_PREFIX = "/api/v1/auth";

const LOCAL_STORAGE_JWT_KEY = LOCAL_STORAGE_SIWE_JWT_KEY;
export const AGORA_SIGN_IN_MESSAGE = "Sign in to Agora with Ethereum";

const SIWE_ENABLED = process.env.NEXT_PUBLIC_SIWE_ENABLED === "true";

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

function getSafeOffchainProposalFlowState() {
  const traceState = getStoredProposalCreationTraceState();
  if (traceState?.branch !== "safe_offchain_draft") {
    return null;
  }

  return getStoredSafeProposalOffchainFlowState();
}

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () => {
    const shouldTrace =
      isMiradorProposalCreationSiweEnabled() &&
      getStoredProposalCreationTraceState()?.branch === "safe_offchain_draft";
    const trace = shouldTrace ? startOrResumeProposalCreationTrace() : null;

    addMiradorEvent(trace, "siwe_nonce_requested");
    flushMiradorTrace(trace);

    const res = await fetch(`${API_AUTH_PREFIX}/nonce`, {
      headers: shouldTrace ? getProposalCreationTraceHeaders() : undefined,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      addMiradorEvent(trace, "siwe_nonce_failed_client", { status: res.status });
      flushMiradorTrace(trace);
      return "";
    }

    addMiradorEvent(trace, "siwe_nonce_received");
    flushMiradorTrace(trace);
    return data?.nonce ?? "";
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

    const shouldTrace =
      isMiradorProposalCreationSiweEnabled() &&
      getStoredProposalCreationTraceState()?.branch === "safe_offchain_draft";
    const trace = shouldTrace
      ? startOrResumeProposalCreationTrace({
          walletAddress: address as `0x${string}`,
          chainId,
        })
      : null;

    addMiradorEvent(trace, "siwe_message_created");

    const miradorChain = getMiradorChainNameFromChainId(chainId);
    if (trace && miradorChain) {
      try {
        const safeMessageHash = await getCanonicalSafeMessageHash({
          safeAddress: address as `0x${string}`,
          chainId,
          message,
        });

        addMiradorSafeMsgHint(
          trace,
          safeMessageHash,
          miradorChain,
          "Create proposal SIWE"
        );
        markSafeProposalOffchainMessageCreated({
          safeAddress: address as `0x${string}`,
          chainId,
          messageHash: safeMessageHash,
        });
      } catch (error) {
        addMiradorEvent(trace, "safe_message_hash_failed", {
          reason: error instanceof Error ? error.message : "unknown",
        });
        setSafeProposalOffchainFlowStatus(
          "failed",
          error instanceof Error
            ? error.message
            : "Unable to compute Safe message hash"
        );
      }
    }

    flushMiradorTrace(trace);
    return message;
  },
  verifyMessage: async ({ message, signature }) => {
    const shouldTrace =
      isMiradorProposalCreationSiweEnabled() &&
      getStoredProposalCreationTraceState()?.branch === "safe_offchain_draft";
    const trace = shouldTrace ? startOrResumeProposalCreationTrace() : null;

    try {
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "awaiting_response");
    } catch {}
    if (shouldTrace) {
      setSafeProposalOffchainFlowStatus("verifying");
    }
    addMiradorEvent(trace, "siwe_verify_requested");
    flushMiradorTrace(trace);
    const res = await fetch(`${API_AUTH_PREFIX}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(shouldTrace ? getProposalCreationTraceHeaders() : {}),
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
      if (shouldTrace) {
        setSafeProposalOffchainFlowStatus(
          "failed",
          `Verification failed (${res.status})`
        );
      }
      if (shouldTrace) {
        await closeStoredProposalCreationTrace({
          eventName: "siwe_verify_failed_client_closed",
          details: { status: res.status },
          reason: "siwe_verify_failed",
        });
      }
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
        if (shouldTrace) {
          setSafeProposalOffchainFlowStatus(
            "failed",
            "Verification returned no token"
          );
        }
        if (shouldTrace) {
          await closeStoredProposalCreationTrace({
            eventName: "siwe_verify_failed_client_closed",
            details: { reason: "missing_token" },
            reason: "siwe_verify_failed",
          });
        }
        return false;
      }

      const safeOffchainFlowState = getSafeOffchainProposalFlowState();
      if (
        safeOffchainFlowState &&
        (safeOffchainFlowState.status === "expired" ||
          safeOffchainFlowState.status === "cancelled" ||
          safeOffchainFlowState.status === "failed" ||
          isSafeProposalOffchainFlowExpired(safeOffchainFlowState))
      ) {
        try {
          localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
        } catch {}
        addMiradorEvent(trace, "siwe_verify_ignored_after_timeout");
        flushMiradorTrace(trace);
        clearStoredSafeProposalOffchainFlowState();
        return false;
      }

      if (safeOffchainFlowState) {
        if (!safeOffchainFlowState.messageHash) {
          try {
            localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
          } catch {}
          addMiradorEvent(trace, "siwe_verify_ignored_without_message_hash");
          flushMiradorTrace(trace);
          return false;
        }

        try {
          const safeMessageHash = await getCanonicalSafeMessageHash({
            safeAddress: safeOffchainFlowState.safeAddress,
            chainId: safeOffchainFlowState.chainId,
            message,
          });

          if (
            safeMessageHash.toLowerCase() !==
            safeOffchainFlowState.messageHash.toLowerCase()
          ) {
            try {
              localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
            } catch {}
            addMiradorEvent(trace, "siwe_verify_ignored_stale_safe_message", {
              expectedMessageHash: safeOffchainFlowState.messageHash,
              receivedMessageHash: safeMessageHash,
            });
            flushMiradorTrace(trace);
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
          return false;
        }
      }

      localStorage.setItem(LOCAL_STORAGE_JWT_KEY, JSON.stringify(token));
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "signed");
      } catch {}
      addMiradorEvent(trace, "siwe_verify_succeeded_client");
      flushMiradorTrace(trace);
      return true;
    } catch {
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      } catch {}
      addMiradorEvent(trace, "siwe_verify_failed_client", {
        reason: "invalid_json",
      });
      flushMiradorTrace(trace);
      if (shouldTrace) {
        setSafeProposalOffchainFlowStatus(
          "failed",
          "Verification returned invalid JSON"
        );
      }
      if (shouldTrace) {
        await closeStoredProposalCreationTrace({
          eventName: "siwe_verify_failed_client_closed",
          details: { reason: "invalid_json" },
          reason: "siwe_verify_failed",
        });
      }
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
    clearStoredSiweSession();
    return Promise.resolve(true);
  },
  enabled: SIWE_ENABLED,
};
