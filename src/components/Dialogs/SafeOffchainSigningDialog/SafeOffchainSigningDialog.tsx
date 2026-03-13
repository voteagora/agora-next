"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Loader2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  FileText,
  Hash,
} from "lucide-react";
import {
  SIWE_NONCE_QUERY_KEY,
  SIWE_SESSION_QUERY_KEY,
  useSIWE,
} from "connectkit";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";

import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";
import ENSName from "@/components/shared/ENSName";
import {
  SafeOwnerStatusRow,
  SafeSignerProgress,
} from "@/components/Safe/SafeSignerStatus";
import { useSafeMessageStatus } from "@/hooks/useSafeMessageStatus";
import { useSafeOwnersAndThreshold } from "@/hooks/useSafeOwnersAndThreshold";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import {
  SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS,
  SafeOffchainSigningKind,
  SafeOffchainSigningPurpose,
  SafeOffchainSigningState,
  clearStoredSafeOffchainSigningState,
  getStoredSafeOffchainSigningState,
  initializeSafeOffchainSigningFlow,
  isSafeOffchainSigningFlowActive,
  isSafeOffchainSigningFlowExpired,
  isSafeOffchainSigningFlowTerminal,
  primeSafeOffchainSigningMessage,
  setSafeOffchainSigningFlowStatus,
  useStoredSafeOffchainSigningState,
} from "@/lib/safeOffchainFlow";
import { encodeSafeMessageConfirmations } from "@/lib/safeTransactionService";
import { clearStoredSiweSession, getStoredSiweJwt } from "@/lib/siweSession";
import { LOCAL_STORAGE_SIWE_STAGE_KEY } from "@/lib/constants";
import {
  closeStoredProposalCreationTrace,
  getProposalCreationTraceHeaders,
  persistProposalCreationTraceState,
  startFreshProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import {
  isSafeOffchainMessageTrackingEnabled,
  SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE,
} from "@/lib/safeFeatures";
import {
  ensureSafeOffchainSigningEnabled,
  getCanonicalSafeMessageHash,
} from "@/lib/safeMessages";

type SafeOffchainFlowClosedReason = "cancelled" | "failed" | "expired";

type SecondaryAction = {
  label: string;
  onAction: () => Promise<void> | void;
};

export type SafeOffchainSigningDialogProps = {
  closeDialog: () => void;
  safeAddress: `0x${string}`;
  chainId?: number;
  purpose: SafeOffchainSigningPurpose;
  signingKind?: SafeOffchainSigningKind;
  message?: string;
  onAuthenticated?: (jwt: string) => Promise<void> | void;
  onCompleted?: (signature: `0x${string}`) => Promise<void> | void;
  onClosed?: (reason: SafeOffchainFlowClosedReason) => void;
  secondaryAction?: SecondaryAction;
  signMessage?: (args: { message: string }) => Promise<`0x${string}`>;
};

type UseSafeOffchainSigningFlowParams = SafeOffchainSigningDialogProps;
const SAFE_DEBUG_LOGS = process.env.NEXT_PUBLIC_SAFE_DEBUG_LOGS === "true";

function logSafeClientDebug(event: Record<string, unknown>) {
  if (!SAFE_DEBUG_LOGS) {
    return;
  }

  console.info("[safe-debug]", event);
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function readStoredSiweStage() {
  try {
    return localStorage.getItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
  } catch {
    return null;
  }
}

function clearStoredSiweStage() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
  } catch {}
}

function SafeMessageDetails({
  messageHash,
  message,
  showReadableMessage,
  onToggle,
}: {
  messageHash: `0x${string}`;
  message?: string;
  showReadableMessage: boolean;
  onToggle: () => void;
}) {
  const canShowReadableMessage = Boolean(message);
  const showingReadableMessage = canShowReadableMessage && showReadableMessage;

  return (
    <div className="flex flex-col w-full gap-3">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-secondary" />
          <span className="text-sm font-bold text-primary tracking-tight">
            {showingReadableMessage ? "Signed Message" : "Message Hash"}
          </span>
        </div>

        {canShowReadableMessage ? (
          <div className="flex items-center p-0.5 rounded-lg bg-muted/50 ring-1 ring-inset ring-line/50">
            <button
              type="button"
              onClick={() => showReadableMessage && onToggle()}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                !showingReadableMessage
                  ? "bg-white dark:bg-neutral text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              Hash
            </button>
            <button
              type="button"
              onClick={() => !showReadableMessage && onToggle()}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                showingReadableMessage
                  ? "bg-white dark:bg-neutral text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Message
            </button>
          </div>
        ) : null}
      </div>

      <div className="bg-muted/30 rounded-xl p-4 ring-1 ring-inset ring-line/50 text-left">
        {showingReadableMessage ? (
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-secondary/90 font-mono custom-scrollbar">
            {message}
          </pre>
        ) : (
          <span className="break-all font-mono text-[12px] text-secondary/80 tracking-tight">
            {messageHash}
          </span>
        )}
      </div>
    </div>
  );
}

function getLoadingCopy(
  purpose: SafeOffchainSigningPurpose,
  signingKind: SafeOffchainSigningKind
) {
  switch (purpose) {
    case "notification_preferences":
      return {
        title: "Opening Safe sign-in",
        description:
          "Preparing the Safe signing flow for notification preferences.",
      };
    case "delegate_statement":
      return {
        title:
          signingKind === "siwe"
            ? "Preparing Safe sign-in"
            : "Preparing Safe signing",
        description:
          signingKind === "siwe"
            ? "Agora is preparing the Safe sign-in flow before it can save your delegate profile."
            : "Agora is preparing the Safe approval flow for the exact delegate profile shown on this page.",
      };
    default:
      return {
        title: "Opening Safe signing",
        description:
          "Preparing the Safe signing flow before Agora can create the offchain draft.",
      };
  }
}

function getProgressCopy(params: {
  purpose: SafeOffchainSigningPurpose;
  signingKind: SafeOffchainSigningKind;
  status?: SafeOffchainSigningState["status"];
  isCompleting: boolean;
}) {
  const { purpose, signingKind, status, isCompleting } = params;

  if (isCompleting) {
    if (purpose === "proposal_draft") {
      return {
        title: "Finalizing Draft",
        description:
          "Safe authentication completed. Agora is creating the draft now.",
      };
    }

    if (purpose === "notification_preferences") {
      return {
        title: "Finishing sign-in",
        description:
          "Safe authentication completed. Agora is opening notification preferences now.",
      };
    }

    return {
      title: "Saving delegate profile",
      description:
        signingKind === "siwe"
          ? "Safe authentication completed. Agora is saving your delegate profile now."
          : "Safe approvals were collected. Agora is saving the exact delegate profile that was approved.",
    };
  }

  if (status === "pending_wallet") {
    if (purpose === "delegate_statement") {
      return {
        title: "Open Safe and start signing",
        description:
          signingKind === "siwe"
            ? "Approve the Safe sign-in request so Agora can authenticate this Safe before saving your delegate profile."
            : "Approve the Safe request for the exact delegate profile shown on this page.",
      };
    }

    if (purpose === "notification_preferences") {
      return {
        title: "Open Safe and start signing",
        description:
          "Approve the Safe sign-in request so Agora can open notification preferences.",
      };
    }

    return {
      title: "Open Safe and start signing",
      description:
        "Approve the Safe sign-in request so Agora can authenticate the Safe before draft creation.",
    };
  }

  if (status === "verifying") {
    if (purpose === "delegate_statement") {
      return {
        title: "Verifying Safe signature",
        description:
          signingKind === "siwe"
            ? "All required Safe signatures were collected. Agora is verifying the Safe sign-in message."
            : "All required Safe signatures were collected. Agora is validating the approved delegate profile message.",
      };
    }

    return {
      title: "Verifying Safe signature",
      description:
        "All required Safe signatures were collected. Agora is verifying the Safe sign-in message.",
    };
  }

  if (purpose === "delegate_statement") {
    return {
      title: "Waiting for Safe confirmations",
      description:
        signingKind === "siwe"
          ? "Keep this page open while the remaining Safe owners approve the delegate-statement sign-in message."
          : "Keep this page open while the remaining Safe owners approve the delegate profile message.",
    };
  }

  if (purpose === "notification_preferences") {
    return {
      title: "Waiting for Safe confirmations",
      description:
        "Keep this page open while the remaining Safe owners approve the notification-preferences sign-in message.",
    };
  }

  return {
    title: "Waiting for Safe confirmations",
    description:
      "Keep this page open while the remaining Safe owners approve the draft sign-in message.",
  };
}

function getFailureFallback(
  purpose: SafeOffchainSigningPurpose,
  signingKind: SafeOffchainSigningKind
) {
  switch (purpose) {
    case "notification_preferences":
      return "The Safe sign-in flow could not be completed in time.";
    case "delegate_statement":
      return signingKind === "siwe"
        ? "The Safe delegate profile sign-in flow could not be completed."
        : "The Safe delegate profile signing flow could not be completed.";
    default:
      return "The Safe offchain signing flow could not be completed in time.";
  }
}

function getInfoCopy(
  purpose: SafeOffchainSigningPurpose,
  signingKind: SafeOffchainSigningKind
) {
  switch (purpose) {
    case "notification_preferences":
      return {
        summary:
          "Agora is waiting for the required Safe signer threshold before it can finish signing you in.",
        detail:
          "This step only authenticates the Safe so Agora can manage notification preferences. It does not submit anything onchain.",
        cancelLabel: "Cancel Safe Sign-in",
      };
    case "delegate_statement":
      return {
        summary:
          signingKind === "siwe"
            ? "Agora is waiting for the required Safe signer threshold before it can finish signing in this Safe and save your delegate profile."
            : "Agora is waiting for the required Safe signer threshold before it can submit the exact delegate profile shown on this page.",
        detail:
          signingKind === "siwe"
            ? "This step authenticates the Safe before Agora saves the delegate profile. It does not submit anything onchain."
            : "This signs the exact delegate profile content you reviewed. Keep this page open, and do not refresh or navigate away while approvals are collected.",
        cancelLabel:
          signingKind === "siwe"
            ? "Cancel Safe Sign-in"
            : "Cancel Delegate Signing",
      };
    default:
      return {
        summary:
          "Agora is waiting for the required Safe signer threshold before it can create the draft.",
        detail:
          "This step only authenticates the Safe so Agora can create a draft. It does not submit a proposal onchain.",
        cancelLabel: "Cancel Signing Flow",
      };
  }
}

function useSafeOffchainSigningFlow({
  closeDialog,
  safeAddress,
  chainId: providedChainId,
  purpose,
  signingKind = "siwe",
  message,
  onAuthenticated,
  onCompleted,
  onClosed,
  signMessage,
}: UseSafeOffchainSigningFlowParams) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isSignedIn, reset, signIn, signOut } = useSIWE();
  const { chain, connector } = useAccount();
  const { data: walletClient } = useWalletClient();

  const matchingStoredFlowState = useStoredSafeOffchainSigningState({
    safeAddress,
    purpose,
    signingKind,
  });
  const flowState =
    signingKind === "raw_message" &&
    message &&
    matchingStoredFlowState?.message &&
    matchingStoredFlowState.message !== message
      ? null
      : matchingStoredFlowState;

  const [now, setNow] = useState(() => Date.now());
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  const activeChainId = flowState?.chainId ?? providedChainId ?? chain?.id;
  const timeoutHandledRef = useRef(false);
  const manualVerifyStartedRef = useRef(false);
  const successStartedRef = useRef(false);
  const proposalTraceFinalizedRef = useRef(false);
  const lastSignedCountRef = useRef<number | null>(null);
  const thresholdLoadedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const autoStartRef = useRef(false);

  const resetLocalRefs = useCallback(() => {
    timeoutHandledRef.current = false;
    manualVerifyStartedRef.current = false;
    successStartedRef.current = false;
    proposalTraceFinalizedRef.current = false;
    lastSignedCountRef.current = null;
    thresholdLoadedRef.current = false;
  }, []);

  const clearSafeFlow = useCallback(
    (options?: { clearSiweSession?: boolean }) => {
      clearStoredSafeOffchainSigningState();
      if (signingKind === "siwe") {
        clearStoredSiweStage();
      }
      if (options?.clearSiweSession) {
        clearStoredSiweSession();
      }

      setStartupError(null);
      setIsStarting(false);
      setIsCompleting(false);
      resetLocalRefs();
    },
    [resetLocalRefs, signingKind]
  );

  const finalizeProposalDraftTrace = useCallback(
    async (options: {
      eventName: string;
      details?: Record<string, unknown> | string;
      reason: string;
    }) => {
      if (purpose !== "proposal_draft" || proposalTraceFinalizedRef.current) {
        return;
      }

      proposalTraceFinalizedRef.current = true;
      await closeStoredProposalCreationTrace({
        eventName: options.eventName,
        details: options.details,
        reason: options.reason,
      });
    },
    [purpose]
  );

  const failCurrentAttempt = useCallback(
    (messageText: string) => {
      const currentState = getStoredSafeOffchainSigningState();
      const expiredByClock =
        currentState &&
        currentState.purpose === purpose &&
        currentState.signingKind === signingKind &&
        currentState.safeAddress.toLowerCase() === safeAddress.toLowerCase() &&
        isSafeOffchainSigningFlowExpired(currentState);

      if (
        currentState &&
        currentState.safeAddress.toLowerCase() === safeAddress.toLowerCase() &&
        currentState.purpose === purpose &&
        currentState.signingKind === signingKind
      ) {
        if (expiredByClock) {
          timeoutHandledRef.current = true;
          setSafeOffchainSigningFlowStatus(
            "expired",
            "The Safe signing flow took longer than 3 minutes."
          );
        } else {
          setSafeOffchainSigningFlowStatus("failed", messageText);
        }
      } else {
        setStartupError(messageText);
      }

      setIsStarting(false);
      setIsCompleting(false);
      successStartedRef.current = false;
      manualVerifyStartedRef.current = false;

      if (expiredByClock) {
        void finalizeProposalDraftTrace({
          eventName: "safe_offchain_signing_timeout_reached",
          details: { signingKind },
          reason: "safe_offchain_signing_expired",
        });
      } else {
        void finalizeProposalDraftTrace({
          eventName: "safe_offchain_signing_failed",
          details: { message: messageText, signingKind },
          reason: "safe_offchain_signing_failed",
        });
      }
    },
    [finalizeProposalDraftTrace, purpose, safeAddress, signingKind]
  );

  const prepareFreshSafeSiweAttempt = useCallback(async () => {
    clearStoredSiweSession();
    clearStoredSiweStage();
    reset();

    if (isSignedIn) {
      try {
        await signOut();
      } catch {}
    }

    await Promise.allSettled([
      queryClient.cancelQueries({
        queryKey: [SIWE_SESSION_QUERY_KEY],
        exact: true,
      }),
      queryClient.cancelQueries({
        queryKey: [SIWE_NONCE_QUERY_KEY],
        exact: true,
      }),
    ]);
  }, [isSignedIn, queryClient, reset, signOut]);

  const prepareFreshProposalDraftTrace = useCallback(async () => {
    if (purpose !== "proposal_draft" || !activeChainId) {
      return;
    }

    const trace = startFreshProposalCreationTrace({
      branch: "safe_offchain_draft",
      walletAddress: safeAddress,
      chainId: activeChainId,
    });
    await persistProposalCreationTraceState(trace, {
      branch: "safe_offchain_draft",
      walletAddress: safeAddress,
      chainId: activeChainId,
      safeAddress,
    });
  }, [activeChainId, purpose, safeAddress]);

  const completeAuthenticatedFlow = useCallback(
    async (jwt: string) => {
      if (successStartedRef.current) {
        return;
      }

      successStartedRef.current = true;
      setIsCompleting(true);
      if (purpose === "proposal_draft") {
        setSafeOffchainSigningFlowStatus("draft_creating");
      } else {
        setSafeOffchainSigningFlowStatus("verifying");
      }

      try {
        await onAuthenticated?.(jwt);
        clearSafeFlow();
        closeDialog();
      } catch (error) {
        successStartedRef.current = false;
        failCurrentAttempt(
          getErrorMessage(
            error,
            purpose === "proposal_draft"
              ? "Failed to create draft"
              : "Failed to sign in with Safe"
          )
        );
      }
    },
    [clearSafeFlow, closeDialog, failCurrentAttempt, onAuthenticated, purpose]
  );

  const completeRawMessageFlow = useCallback(
    async (signature: `0x${string}`) => {
      if (successStartedRef.current) {
        return;
      }

      successStartedRef.current = true;
      setIsCompleting(true);
      setSafeOffchainSigningFlowStatus("verifying");

      try {
        await onCompleted?.(signature);
        clearSafeFlow();
        closeDialog();
      } catch (error) {
        successStartedRef.current = false;
        failCurrentAttempt(
          getErrorMessage(
            error,
            "There was an error submitting your delegate profile."
          )
        );
      }
    },
    [clearSafeFlow, closeDialog, failCurrentAttempt, onCompleted]
  );

  const handleTimeout = useCallback(() => {
    const latestState = getStoredSafeOffchainSigningState();
    if (
      timeoutHandledRef.current ||
      !latestState ||
      latestState.purpose !== purpose ||
      latestState.signingKind !== signingKind ||
      latestState.safeAddress.toLowerCase() !== safeAddress.toLowerCase() ||
      !isSafeOffchainSigningFlowExpired(latestState) ||
      latestState.status === "cancelled"
    ) {
      return;
    }

    timeoutHandledRef.current = true;
    if (signingKind === "siwe") {
      clearStoredSiweSession();
    }
    if (latestState.status !== "expired") {
      setSafeOffchainSigningFlowStatus(
        "expired",
        "The Safe signing flow took longer than 3 minutes."
      );
    }
    setIsStarting(false);
    setIsCompleting(false);

    void finalizeProposalDraftTrace({
      eventName: "safe_offchain_signing_timeout_reached",
      details: { signingKind },
      reason: "safe_offchain_signing_expired",
    });
  }, [finalizeProposalDraftTrace, purpose, safeAddress, signingKind]);

  const cancelActiveFlow = useCallback(
    (
      reason: SafeOffchainFlowClosedReason,
      options: { close?: boolean } = {}
    ) => {
      void finalizeProposalDraftTrace({
        eventName: "safe_offchain_signing_cancelled",
        details: { signingKind, reason },
        reason: "safe_offchain_signing_cancelled",
      });
      clearSafeFlow({ clearSiweSession: signingKind === "siwe" });
      onClosed?.(reason);
      if (options.close) {
        closeDialog();
      }
    },
    [
      clearSafeFlow,
      closeDialog,
      finalizeProposalDraftTrace,
      onClosed,
      signingKind,
    ]
  );

  const startFlow = useCallback(
    async (options?: { restarted?: boolean }) => {
      resetLocalRefs();
      setStartupError(null);
      setIsCompleting(false);
      setIsStarting(true);

      if (!isSafeOffchainMessageTrackingEnabled()) {
        failCurrentAttempt(SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE);
        return;
      }

      if (!activeChainId) {
        failCurrentAttempt("Unable to determine the connected chain.");
        return;
      }

      try {
        const settingsStatus =
          await ensureSafeOffchainSigningEnabled(walletClient);
        logSafeClientDebug({
          event: "safe_offchain_settings",
          purpose,
          signingKind,
          safeAddress,
          chainId: activeChainId,
          connectorId: connector?.id,
          connectorName: connector?.name,
          settingsStatus,
        });
      } catch (error) {
        failCurrentAttempt(
          getErrorMessage(error, "Unable to prepare Safe offchain signing.")
        );
        return;
      }

      if (signingKind === "siwe") {
        const jwt = getStoredSiweJwt({
          expectedAddress: safeAddress,
        });
        if (jwt) {
          setIsStarting(false);
          await completeAuthenticatedFlow(jwt);
          return;
        }

        await prepareFreshSafeSiweAttempt();
        initializeSafeOffchainSigningFlow({
          safeAddress,
          chainId: activeChainId,
          purpose,
          signingKind,
        });

        let signInResult: Awaited<ReturnType<typeof signIn>>;
        try {
          signInResult = await signIn();
        } catch (error) {
          const latestState = getStoredSafeOffchainSigningState();
          const isSafeFlowInProgress =
            latestState &&
            latestState.purpose === purpose &&
            latestState.signingKind === signingKind &&
            latestState.safeAddress.toLowerCase() ===
              safeAddress.toLowerCase() &&
            latestState.messageHash;

          if (isSafeFlowInProgress) {
            return;
          }

          failCurrentAttempt(
            getErrorMessage(error, "Sign-in cancelled or failed.")
          );
          return;
        } finally {
          setIsStarting(false);
        }

        if (signInResult === false) {
          const latestState = getStoredSafeOffchainSigningState();
          const isSafeFlowInProgress =
            latestState &&
            latestState.purpose === purpose &&
            latestState.signingKind === signingKind &&
            latestState.safeAddress.toLowerCase() ===
              safeAddress.toLowerCase() &&
            latestState.messageHash;

          if (!isSafeFlowInProgress) {
            failCurrentAttempt("Sign-in cancelled or failed.");
          }
        }

        return;
      }

      if (!message || !signMessage || !onCompleted) {
        failCurrentAttempt(
          "Unable to start Safe signing for this delegate profile."
        );
        return;
      }

      initializeSafeOffchainSigningFlow({
        safeAddress,
        chainId: activeChainId,
        purpose,
        signingKind,
      });

      let safeMessageHash: `0x${string}`;
      try {
        safeMessageHash = await getCanonicalSafeMessageHash({
          safeAddress,
          chainId: activeChainId,
          message,
        });
      } catch (error) {
        failCurrentAttempt(
          getErrorMessage(error, "Unable to compute the Safe message hash.")
        );
        return;
      }

      primeSafeOffchainSigningMessage({
        safeAddress,
        chainId: activeChainId,
        purpose,
        signingKind,
        messageHash: safeMessageHash,
        message,
      });
      logSafeClientDebug({
        event: "safe_raw_message_created",
        purpose,
        signingKind,
        safeAddress,
        chainId: activeChainId,
        messageHash: safeMessageHash,
        messageLength: message.length,
        messagePreview: message.slice(0, 120),
      });

      try {
        const signature = await signMessage({ message });
        setIsStarting(false);

        const latestState = getStoredSafeOffchainSigningState();
        if (
          !latestState ||
          latestState.purpose !== purpose ||
          latestState.signingKind !== signingKind ||
          latestState.safeAddress.toLowerCase() !== safeAddress.toLowerCase() ||
          isSafeOffchainSigningFlowTerminal(latestState) ||
          isSafeOffchainSigningFlowExpired(latestState)
        ) {
          return;
        }

        if (!signature) {
          failCurrentAttempt("Signature failed, please try again.");
          return;
        }

        if (signature === "0x") {
          setSafeOffchainSigningFlowStatus("waiting_for_signatures");
          return;
        }

        await completeRawMessageFlow(signature);
      } catch (error) {
        setIsStarting(false);
        failCurrentAttempt(
          getErrorMessage(error, "Signature failed, please try again.")
        );
      }
    },
    [
      activeChainId,
      completeAuthenticatedFlow,
      completeRawMessageFlow,
      failCurrentAttempt,
      message,
      onCompleted,
      prepareFreshSafeSiweAttempt,
      purpose,
      resetLocalRefs,
      safeAddress,
      signIn,
      signMessage,
      signingKind,
      connector?.id,
      connector?.name,
      walletClient,
    ]
  );

  const handleStartOver = useCallback(async () => {
    clearSafeFlow({ clearSiweSession: signingKind === "siwe" });
    await prepareFreshProposalDraftTrace();
    await startFlow({ restarted: true });
  }, [clearSafeFlow, prepareFreshProposalDraftTrace, signingKind, startFlow]);

  useEffect(() => {
    if (!flowState?.expiresAt) {
      return;
    }

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [flowState?.expiresAt]);

  useEffect(() => {
    if (
      flowState &&
      isSafeOffchainSigningFlowActive(flowState) &&
      isSafeOffchainSigningFlowExpired(flowState)
    ) {
      handleTimeout();
    }
  }, [flowState, handleTimeout, now]);

  useEffect(() => {
    if (purpose !== "proposal_draft" || !flowState) {
      return;
    }

    if (flowState.status === "expired") {
      void finalizeProposalDraftTrace({
        eventName: "safe_offchain_signing_timeout_reached",
        details: {
          signingKind,
          expiredAt: flowState.expiresAt,
          observedAt: Date.now(),
        },
        reason: "safe_offchain_signing_expired",
      });
      return;
    }

    if (flowState.status === "failed") {
      void finalizeProposalDraftTrace({
        eventName: "safe_offchain_signing_failed",
        details: {
          signingKind,
          message: flowState.errorMessage ?? startupError ?? undefined,
        },
        reason: "safe_offchain_signing_failed",
      });
      return;
    }

    if (flowState.status === "cancelled") {
      void finalizeProposalDraftTrace({
        eventName: "safe_offchain_signing_cancelled",
        details: { signingKind, reason: "cancelled" },
        reason: "safe_offchain_signing_cancelled",
      });
    }
  }, [
    finalizeProposalDraftTrace,
    flowState,
    purpose,
    signingKind,
    startupError,
  ]);

  useEffect(() => {
    if (autoStartRef.current) {
      return;
    }

    if (
      flowState &&
      !isSafeOffchainSigningFlowTerminal(flowState) &&
      !isSafeOffchainSigningFlowExpired(flowState)
    ) {
      return;
    }

    autoStartRef.current = true;
    void startFlow();
  }, [flowState, startFlow]);

  const hasEnteredTrackedSafeFlow = Boolean(flowState?.messageHash);

  useEffect(() => {
    if (!isStarting || !hasEnteredTrackedSafeFlow) {
      return;
    }

    setIsStarting(false);
  }, [hasEnteredTrackedSafeFlow, isStarting]);

  useEffect(() => {
    if (
      signingKind !== "siwe" ||
      !flowState ||
      !isSafeOffchainSigningFlowActive(flowState)
    ) {
      return;
    }

    const intervalId = setInterval(() => {
      const latestState = getStoredSafeOffchainSigningState();
      if (
        !latestState ||
        latestState.purpose !== purpose ||
        latestState.signingKind !== signingKind ||
        latestState.safeAddress.toLowerCase() !== safeAddress.toLowerCase() ||
        !isSafeOffchainSigningFlowActive(latestState)
      ) {
        return;
      }

      if (isSafeOffchainSigningFlowExpired(latestState)) {
        handleTimeout();
        return;
      }

      const stage = readStoredSiweStage();
      if (stage === "awaiting_response" && latestState.status !== "verifying") {
        setSafeOffchainSigningFlowStatus("verifying");
      }

      const jwt = getStoredSiweJwt({
        expectedAddress: safeAddress,
      });
      if (!jwt || successStartedRef.current) {
        return;
      }

      if (
        isSafeOffchainSigningFlowTerminal(latestState) ||
        isSafeOffchainSigningFlowExpired(latestState)
      ) {
        clearSafeFlow();
        return;
      }

      void completeAuthenticatedFlow(jwt);
    }, 250);

    return () => clearInterval(intervalId);
  }, [
    clearSafeFlow,
    completeAuthenticatedFlow,
    flowState,
    handleTimeout,
    purpose,
    safeAddress,
    signingKind,
  ]);

  useEffect(() => {
    if (!flowState || !isSafeOffchainSigningFlowActive(flowState)) {
      return;
    }

    const handlePageHide = () => {
      cancelActiveFlow("cancelled");
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [cancelActiveFlow, flowState]);

  useEffect(() => {
    if (pathnameRef.current !== pathname && flowState) {
      cancelActiveFlow("cancelled");
    }

    pathnameRef.current = pathname;
  }, [cancelActiveFlow, flowState, pathname]);

  const ownersAndThresholdQuery = useSafeOwnersAndThreshold({
    safeAddress,
    chainId: activeChainId,
    enabled: Boolean(activeChainId) && Boolean(flowState),
  });

  const shouldPollMessageStatus =
    Boolean(flowState?.messageHash) &&
    flowState?.status !== "expired" &&
    flowState?.status !== "failed" &&
    flowState?.status !== "cancelled" &&
    !isCompleting;

  const safeMessageStatusQuery = useSafeMessageStatus({
    chainId: activeChainId,
    messageHash: flowState?.messageHash,
    safeAddress,
    enabled: shouldPollMessageStatus,
    getHeaders:
      purpose === "proposal_draft"
        ? getProposalCreationTraceHeaders
        : undefined,
  });

  const signedOwnersSet = useMemo(
    () => new Set(safeMessageStatusQuery.data?.status?.signedOwners ?? []),
    [safeMessageStatusQuery.data?.status?.signedOwners]
  );

  const signedCount = signedOwnersSet.size;

  useEffect(() => {
    if (!flowState?.messageHash || !ownersAndThresholdQuery.data) {
      return;
    }

    if (thresholdLoadedRef.current) {
      return;
    }

    thresholdLoadedRef.current = true;
  }, [flowState?.messageHash, ownersAndThresholdQuery.data]);

  useEffect(() => {
    if (!flowState?.messageHash) {
      return;
    }

    if (lastSignedCountRef.current === signedCount) {
      return;
    }

    lastSignedCountRef.current = signedCount;
  }, [flowState?.messageHash, signedCount]);

  useEffect(() => {
    if (
      !flowState?.message ||
      !flowState.messageHash ||
      !ownersAndThresholdQuery.data?.threshold ||
      flowState.status === "draft_creating" ||
      isSafeOffchainSigningFlowTerminal(flowState) ||
      isSafeOffchainSigningFlowExpired(flowState) ||
      signedCount < ownersAndThresholdQuery.data.threshold ||
      manualVerifyStartedRef.current ||
      successStartedRef.current
    ) {
      return;
    }

    const encodedSignatures = encodeSafeMessageConfirmations(
      safeMessageStatusQuery.data?.status?.confirmations ?? []
    );
    if (encodedSignatures === "0x") {
      return;
    }

    manualVerifyStartedRef.current = true;
    setSafeOffchainSigningFlowStatus("verifying");

    if (signingKind === "siwe") {
      if (getStoredSiweJwt({ expectedAddress: safeAddress })) {
        return;
      }

      void siweProviderConfig
        .verifyMessage({
          message: flowState.message,
          signature: encodedSignatures,
        })
        .then((verified) => {
          if (!verified) {
            manualVerifyStartedRef.current = false;
            failCurrentAttempt("Failed to verify Safe signature.");
            return;
          }

          const jwt = getStoredSiweJwt({
            expectedAddress: safeAddress,
          });
          if (jwt) {
            void completeAuthenticatedFlow(jwt);
          }
        })
        .catch((error) => {
          manualVerifyStartedRef.current = false;
          failCurrentAttempt(
            getErrorMessage(error, "Failed to verify Safe signature.")
          );
        });
      return;
    }

    void completeRawMessageFlow(encodedSignatures).catch((error) => {
      manualVerifyStartedRef.current = false;
      failCurrentAttempt(
        getErrorMessage(
          error,
          "There was an error submitting your delegate profile."
        )
      );
    });
  }, [
    completeAuthenticatedFlow,
    completeRawMessageFlow,
    failCurrentAttempt,
    flowState?.message,
    flowState?.messageHash,
    flowState?.status,
    ownersAndThresholdQuery.data?.threshold,
    safeAddress,
    safeMessageStatusQuery.data?.status?.confirmations,
    signedCount,
    signingKind,
  ]);

  const ownerRows = useMemo(() => {
    const owners = ownersAndThresholdQuery.data?.owners ?? [];

    return owners.map((owner) => ({
      owner,
      signed: signedOwnersSet.has(owner),
    }));
  }, [ownersAndThresholdQuery.data?.owners, signedOwnersSet]);

  return {
    activeChainId,
    flowState,
    hasEnteredTrackedSafeFlow,
    isCompleting,
    isStarting,
    ownerRows,
    ownersAndThresholdQuery,
    remainingMs: flowState?.expiresAt
      ? Math.max(0, flowState.expiresAt - now)
      : SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS,
    safeMessageStatusQuery,
    signedCount,
    startupError,
    cancelActiveFlow,
    handleStartOver,
  };
}

export function SafeOffchainSigningDialog(
  props: SafeOffchainSigningDialogProps
) {
  const {
    closeDialog,
    purpose,
    safeAddress,
    secondaryAction,
    onClosed,
    signingKind = "siwe",
  } = props;
  const {
    flowState,
    hasEnteredTrackedSafeFlow,
    isCompleting,
    isStarting,
    ownerRows,
    ownersAndThresholdQuery,
    remainingMs,
    safeMessageStatusQuery,
    signedCount,
    startupError,
    cancelActiveFlow,
    handleStartOver,
  } = useSafeOffchainSigningFlow(props);

  const loadingCopy = getLoadingCopy(purpose, signingKind);
  const progressCopy = getProgressCopy({
    purpose,
    signingKind,
    status: flowState?.status,
    isCompleting,
  });
  const infoCopy = getInfoCopy(purpose, signingKind);
  const isExpired = flowState?.status === "expired";
  const isFailed = flowState?.status === "failed" || Boolean(startupError);
  const failureReason: SafeOffchainFlowClosedReason = isExpired
    ? "expired"
    : "failed";
  const failureMessage =
    startupError ??
    flowState?.errorMessage ??
    getFailureFallback(purpose, signingKind);
  const showLoading =
    (isStarting && !hasEnteredTrackedSafeFlow) || (!flowState && !startupError);
  const [showReadableMessage, setShowReadableMessage] = useState(false);

  useEffect(() => {
    setShowReadableMessage(false);
  }, [flowState?.messageHash]);

  return (
    <div className="flex w-full max-w-[40rem] flex-col gap-6">
      {showLoading ? (
        <div className="flex min-h-[22rem] flex-col items-center justify-center gap-6 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/20">
            <Loader2 className="h-9 w-9 animate-spin text-neutral" />
          </div>
          <div className="flex max-w-[24rem] flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-primary">
              {loadingCopy.title}
            </h2>
            <p className="text-secondary">{loadingCopy.description}</p>
          </div>
        </div>
      ) : isExpired || isFailed ? (
        <div className="flex flex-col gap-8 text-center items-center w-full animate-in fade-in duration-500">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/20 -rotate-3">
            <AlertTriangle className="h-10 w-10 text-white" />
            <div className="absolute inset-0 rounded-3xl animate-ping ring-2 ring-red-500/20 duration-1000" />
          </div>

          <div className="flex flex-col gap-3 max-w-[24rem]">
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              {isExpired ? "Time Expired" : "Signing Failed"}
            </h2>
            <p className="text-secondary text-base leading-relaxed">
              {failureMessage}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-line bg-muted/30 p-5 shadow-inner text-left flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-secondary" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  Safe Account
                </span>
                <span className="font-mono font-medium text-primary">
                  <ENSName address={safeAddress} />
                </span>
              </div>
            </div>
            {flowState?.messageHash ? (
              <>
                <div className="h-px w-full bg-line/50" />
                <SafeMessageDetails
                  messageHash={flowState.messageHash}
                  message={flowState.message}
                  showReadableMessage={showReadableMessage}
                  onToggle={() =>
                    setShowReadableMessage((currentValue) => !currentValue)
                  }
                />
              </>
            ) : null}
          </div>

          <div className="flex flex-col w-full gap-3 pt-2">
            <UpdatedButton
              onClick={() => void handleStartOver()}
              type="primary"
              className="w-full text-base font-semibold h-14 rounded-xl shadow-lg"
            >
              Try Again
            </UpdatedButton>
            {secondaryAction ? (
              <UpdatedButton
                onClick={() => void secondaryAction.onAction()}
                type="secondary"
                className="w-full text-base font-semibold h-14 rounded-xl group flex items-center justify-center gap-2"
              >
                {secondaryAction.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </UpdatedButton>
            ) : null}
            <div className="flex justify-center mt-2">
              <button
                onClick={() => {
                  cancelActiveFlow(failureReason, { close: true });
                }}
                className="text-sm font-semibold text-secondary hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-muted"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative w-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-[3xl] opacity-50 pointer-events-none animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[3xl] opacity-50 pointer-events-none animate-pulse delay-1000" />

          <div className="flex flex-col items-center justify-center text-center gap-3 pb-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-semibold ring-1 ring-primary/10 mb-1 shadow-sm">
              {flowState?.status === "pending_wallet" ? (
                <Wallet className="h-4 w-4" />
              ) : flowState?.status === "waiting_for_signatures" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              )}
              <span>{progressCopy.title}</span>
            </div>
            <p className="text-secondary max-w-[24rem] text-sm leading-relaxed">
              {progressCopy.description}
            </p>
          </div>

          <div className="flex gap-4 items-stretch justify-center relative z-10">
            <div className="flex-1 rounded-3xl bg-neutral ring-1 ring-line shadow-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:ring-primary/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-5 z-10">
                Signatures
              </p>
              <SafeSignerProgress
                signed={signedCount}
                threshold={ownersAndThresholdQuery.data?.threshold ?? 1}
              />
            </div>

            <div className="flex-1 rounded-3xl bg-neutral ring-1 ring-line shadow-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:ring-amber-500/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 z-10 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Time Left
              </p>
              <div className="flex items-baseline justify-center gap-1 z-10">
                <span className="font-mono text-5xl font-extrabold tracking-tighter text-primary">
                  {flowState?.expiresAt
                    ? formatCountdown(remainingMs).split(":")[0]
                    : "--"}
                </span>
                <span className="text-3xl font-bold text-secondary/30 animate-pulse pb-1">
                  :
                </span>
                <span className="font-mono text-5xl font-extrabold tracking-tighter text-primary">
                  {flowState?.expiresAt
                    ? formatCountdown(remainingMs).split(":")[1]
                    : "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-neutral ring-1 ring-line shadow-xl overflow-hidden flex flex-col relative z-10">
            <div className="bg-muted/30 px-6 py-4 border-b border-line flex justify-between items-center">
              <p className="text-sm font-bold text-primary tracking-tight">
                Safe Owners
              </p>
              {safeMessageStatusQuery.data?.status === null &&
              flowState?.messageHash ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Loader2 className="h-3 w-3 animate-spin" /> Pending API
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Live Status
                </span>
              )}
            </div>

            <div className="flex flex-col max-h-[16rem] overflow-y-auto custom-scrollbar p-2 gap-1">
              {ownerRows.length > 0 ? (
                ownerRows.map(({ owner, signed }) => (
                  <SafeOwnerStatusRow
                    key={owner}
                    owner={owner}
                    signed={signed}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Wallet className="h-10 w-10 text-secondary/20 mb-3" />
                  <p className="text-sm font-medium text-secondary">
                    {ownersAndThresholdQuery.isError
                      ? "Error loading owners."
                      : "Fetching owner details..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-neutral p-4 shadow-sm relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              <p className="text-sm font-semibold text-primary">
                What Happens Next
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 ring-1 ring-inset ring-line/50">
              <p className="text-sm text-secondary leading-relaxed">
                {flowState?.status === "pending_wallet"
                  ? progressCopy.description
                  : flowState?.status === "verifying"
                    ? progressCopy.description
                    : infoCopy.summary}
              </p>
              <div className="flex items-start gap-2 text-sm text-secondary">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{infoCopy.detail}</p>
              </div>
            </div>
          </div>

          {flowState?.messageHash ? (
            <div className="rounded-xl border border-line bg-neutral p-4 shadow-sm relative z-10">
              <SafeMessageDetails
                messageHash={flowState.messageHash}
                message={flowState.message}
                showReadableMessage={showReadableMessage}
                onToggle={() =>
                  setShowReadableMessage((currentValue) => !currentValue)
                }
              />
            </div>
          ) : null}

          <div className="flex justify-center mt-2 relative z-10">
            <button
              onClick={() => cancelActiveFlow("cancelled", { close: true })}
              className="text-sm font-semibold text-secondary hover:text-red-500 transition-colors py-2 px-4 rounded-lg hover:bg-red-500/10"
            >
              {infoCopy.cancelLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SafeOffchainSigningDialog;
