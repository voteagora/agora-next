"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  SIWE_NONCE_QUERY_KEY,
  SIWE_SESSION_QUERY_KEY,
  useSIWE,
} from "connectkit";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";
import { useSafeMessageStatus } from "@/hooks/useSafeMessageStatus";
import { useSafeOwnersAndThreshold } from "@/hooks/useSafeOwnersAndThreshold";
import {
  closeStoredProposalCreationTrace,
  getProposalCreationTraceHeaders,
  markProposalCreationBranch,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import { addMiradorEvent, flushMiradorTrace } from "@/lib/mirador/webTrace";
import {
  clearStoredSafeProposalOffchainFlowState,
  getStoredSafeProposalOffchainFlowState,
  initializeSafeProposalOffchainFlow,
  isSafeProposalOffchainFlowActive,
  isSafeProposalOffchainFlowExpired,
  SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS,
  SafeProposalOffchainFlowState,
  setSafeProposalOffchainFlowStatus,
  subscribeToSafeProposalOffchainFlowState,
} from "@/lib/safeOffchainFlow";
import { clearStoredSiweSession, getStoredSiweJwt } from "@/lib/siweSession";
import { LOCAL_STORAGE_SIWE_STAGE_KEY } from "@/lib/constants";
import { shortAddress } from "@/lib/utils";

type SafeProposalChoiceDialogProps = {
  closeDialog: () => void;
  safeAddress: `0x${string}`;
  chainId?: number;
};

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
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

export function SafeProposalChoiceDialog({
  closeDialog,
  safeAddress,
  chainId: providedChainId,
}: SafeProposalChoiceDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "offchain" | "onchain" | null
  >(null);
  const [flowState, setFlowState] = useState<SafeProposalOffchainFlowState | null>(
    () => {
      const storedState = getStoredSafeProposalOffchainFlowState();
      return storedState?.safeAddress === safeAddress ? storedState : null;
    }
  );
  const [now, setNow] = useState(() => Date.now());

  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isSignedIn, reset, signIn, signOut } = useSIWE();
  const { chain } = useAccount();
  const activeChainId = flowState?.chainId ?? providedChainId ?? chain?.id;
  const submitStartedRef = useRef(false);
  const timeoutHandledRef = useRef(false);
  const lastSignedCountRef = useRef<number | null>(null);
  const thresholdLoadedRef = useRef(false);
  const pathnameRef = useRef(pathname);

  const resetLocalProgressRefs = useCallback(() => {
    submitStartedRef.current = false;
    timeoutHandledRef.current = false;
    lastSignedCountRef.current = null;
    thresholdLoadedRef.current = false;
  }, []);

  const resetOffchainUi = useCallback(() => {
    clearStoredSafeProposalOffchainFlowState();
    clearStoredSiweStage();
    resetLocalProgressRefs();
    setAcknowledged(false);
    setFlowState(null);
  }, [resetLocalProgressRefs]);

  const closeSafeProposalTrace = useCallback(
    async (
      eventName: string,
      details?: Record<string, unknown> | string,
      reason?: string
    ) => {
      await closeStoredProposalCreationTrace({
        eventName,
        details,
        reason,
      });
    },
    []
  );

  const handleCloseChoiceScreen = useCallback(async () => {
    clearStoredSiweStage();
    resetOffchainUi();
    await closeSafeProposalTrace(
      "safe_proposal_choice_cancelled",
      "User closed the Safe proposal choice dialog.",
      "safe_proposal_choice_cancelled"
    );
    closeDialog();
  }, [closeDialog, closeSafeProposalTrace, resetOffchainUi]);

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
      queryClient.invalidateQueries({
        queryKey: [SIWE_SESSION_QUERY_KEY],
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: [SIWE_NONCE_QUERY_KEY],
        exact: true,
      }),
    ]);

    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: [SIWE_SESSION_QUERY_KEY],
        exact: true,
      }),
      queryClient.refetchQueries({
        queryKey: [SIWE_NONCE_QUERY_KEY],
        exact: true,
      }),
    ]);
  }, [isSignedIn, queryClient, reset, signOut]);

  const submitDraftCreation = useCallback(
    async (jwt: string) => {
      const trace = startOrResumeProposalCreationTrace({
        branch: "safe_offchain_draft",
        walletAddress: safeAddress,
        chainId: activeChainId,
      });
      addMiradorEvent(trace, "proposal_draft_create_requested");
      flushMiradorTrace(trace);

      setSafeProposalOffchainFlowStatus("draft_creating");

      const response = await fetch("/api/v1/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
          ...getProposalCreationTraceHeaders(),
        },
        body: JSON.stringify({
          creatorAddress: safeAddress,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message =
          typeof body?.message === "string"
            ? body.message
            : "Failed to create draft";
        setSafeProposalOffchainFlowStatus("failed", message);
        await closeSafeProposalTrace(
          "proposal_draft_create_failed_client",
          { message, status: response.status },
          "proposal_draft_create_failed"
        );
        throw new Error(message);
      }

      const proposal = await response.json();
      resetOffchainUi();
      await closeSafeProposalTrace(
        "proposal_draft_created_client",
        { draftId: proposal.uuid },
        "proposal_draft_created"
      );
      closeDialog();
      router.push(`/proposals/draft/${proposal.uuid}`);
    },
    [
      activeChainId,
      closeDialog,
      closeSafeProposalTrace,
      resetOffchainUi,
      router,
      safeAddress,
    ]
  );

  const handleTimeout = useCallback(async () => {
    const latestState = getStoredSafeProposalOffchainFlowState();
    if (
      timeoutHandledRef.current ||
      !latestState ||
      !isSafeProposalOffchainFlowActive(latestState)
    ) {
      return;
    }

    timeoutHandledRef.current = true;
    clearStoredSiweSession();
    setSafeProposalOffchainFlowStatus(
      "expired",
      "The Safe signing flow took longer than 3 minutes."
    );
    await closeSafeProposalTrace(
      "safe_offchain_timeout",
      {
        messageHash: latestState.messageHash,
        timeoutMs: SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS,
      },
      "safe_offchain_timeout"
    );
  }, [closeSafeProposalTrace]);

  const cancelActiveFlow = useCallback(
    async (
      eventName: string,
      details: Record<string, unknown> | string,
      reason: string,
      options: { close?: boolean } = {}
    ) => {
      clearStoredSiweSession();
      resetOffchainUi();
      await closeSafeProposalTrace(eventName, details, reason);
      if (options.close) {
        closeDialog();
      }
    },
    [closeDialog, closeSafeProposalTrace, resetOffchainUi]
  );

  const handleSkipToOnchain = useCallback(async () => {
    setPendingAction("onchain");

    try {
      clearStoredSiweStage();
      resetOffchainUi();

      const trace = startOrResumeProposalCreationTrace({
        walletAddress: safeAddress,
        chainId: activeChainId,
      });
      addMiradorEvent(trace, "safe_proposal_choice_direct_onchain_selected");
      flushMiradorTrace(trace);

      await markProposalCreationBranch("safe_direct_onchain", trace, {
        walletAddress: safeAddress,
        chainId: activeChainId,
        safeAddress,
      });

      closeDialog();
      router.push("/proposals/create-proposal");
    } finally {
      setPendingAction(null);
    }
  }, [activeChainId, closeDialog, resetOffchainUi, router, safeAddress]);

  const handleCreateDraftOffchain = useCallback(async (options?: {
    restarted?: boolean;
  }) => {
    if (!activeChainId) {
      toast("Unable to determine the connected chain.");
      return;
    }

    setPendingAction("offchain");

    try {
      const trace = startOrResumeProposalCreationTrace({
        walletAddress: safeAddress,
        chainId: activeChainId,
      });
      if (options?.restarted) {
        addMiradorEvent(trace, "safe_offchain_restart_selected");
      }
      addMiradorEvent(trace, "safe_proposal_choice_offchain_selected", {
        restarted: options?.restarted === true,
      });
      flushMiradorTrace(trace);

      await markProposalCreationBranch("safe_offchain_draft", trace, {
        walletAddress: safeAddress,
        chainId: activeChainId,
        safeAddress,
      });

      const jwt = getStoredSiweJwt({
        expectedAddress: safeAddress,
      });
      if (jwt) {
        await submitDraftCreation(jwt);
        return;
      }

      await prepareFreshSafeSiweAttempt();
      initializeSafeProposalOffchainFlow({
        safeAddress,
        chainId: activeChainId,
      });
      addMiradorEvent(trace, "safe_offchain_flow_started", {
        restarted: options?.restarted === true,
      });
      flushMiradorTrace(trace);

      const signInResult = await signIn();
      if (signInResult !== false) {
        return;
      }

      const latestState = getStoredSafeProposalOffchainFlowState();
      if (
        !latestState ||
        !isSafeProposalOffchainFlowActive(latestState) ||
        latestState.status !== "pending_wallet" ||
        Boolean(latestState.messageHash)
      ) {
        return;
      }

      setSafeProposalOffchainFlowStatus(
        "failed",
        "Sign-in cancelled or failed."
      );
      await closeSafeProposalTrace(
        "safe_proposal_siwe_cancelled",
        {
          restarted: options?.restarted === true,
        },
        "safe_proposal_siwe_cancelled"
      );
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to create draft"
      );
    } finally {
      setPendingAction(null);
    }
  }, [
    activeChainId,
    closeSafeProposalTrace,
    prepareFreshSafeSiweAttempt,
    safeAddress,
    signIn,
    submitDraftCreation,
  ]);

  const handleStartOver = useCallback(async () => {
    resetOffchainUi();
    await handleCreateDraftOffchain({ restarted: true });
  }, [handleCreateDraftOffchain, resetOffchainUi]);

  useEffect(() => {
    return subscribeToSafeProposalOffchainFlowState((nextState) => {
      if (!nextState || nextState.safeAddress === safeAddress) {
        setFlowState(nextState);
      }
    });
  }, [safeAddress]);

  useEffect(() => {
    if (!flowState || !flowState.expiresAt) {
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
      isSafeProposalOffchainFlowActive(flowState) &&
      isSafeProposalOffchainFlowExpired(flowState)
    ) {
      void handleTimeout();
    }
  }, [flowState, handleTimeout, now]);

  useEffect(() => {
    if (!flowState || !isSafeProposalOffchainFlowActive(flowState)) {
      return;
    }

    const intervalId = setInterval(() => {
      const latestState = getStoredSafeProposalOffchainFlowState();
      if (!latestState || !isSafeProposalOffchainFlowActive(latestState)) {
        return;
      }

      if (isSafeProposalOffchainFlowExpired(latestState)) {
        void handleTimeout();
        return;
      }

      const stage = readStoredSiweStage();
      if (stage === "awaiting_response" && latestState.status !== "verifying") {
        setSafeProposalOffchainFlowStatus("verifying");
      }

      const jwt = getStoredSiweJwt({
        expectedAddress: safeAddress,
      });
      if (jwt && !submitStartedRef.current) {
        submitStartedRef.current = true;
        void submitDraftCreation(jwt).catch((error) => {
          submitStartedRef.current = false;
          toast(
            error instanceof Error ? error.message : "Failed to create draft"
          );
        });
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [flowState, handleTimeout, safeAddress, submitDraftCreation]);

  useEffect(() => {
    if (!flowState || !isSafeProposalOffchainFlowActive(flowState)) {
      return;
    }

    const handlePageHide = () => {
      void cancelActiveFlow(
        "safe_offchain_page_left",
        "User left the page during the Safe offchain flow.",
        "safe_offchain_page_left"
      );
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [cancelActiveFlow, flowState]);

  useEffect(() => {
    if (pathnameRef.current !== pathname && flowState) {
      void cancelActiveFlow(
        "safe_offchain_page_left",
        "User navigated away during the Safe offchain flow.",
        "safe_offchain_page_left"
      );
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
    flowState?.status !== "draft_creating";

  const safeMessageStatusQuery = useSafeMessageStatus({
    chainId: activeChainId,
    messageHash: flowState?.messageHash,
    enabled: shouldPollMessageStatus,
  });

  useEffect(() => {
    if (!flowState || !ownersAndThresholdQuery.data || thresholdLoadedRef.current) {
      return;
    }

    thresholdLoadedRef.current = true;
    const trace = startOrResumeProposalCreationTrace({
      branch: "safe_offchain_draft",
      walletAddress: safeAddress,
      chainId: activeChainId,
    });
    addMiradorEvent(trace, "safe_offchain_threshold_loaded", {
      ownerCount: ownersAndThresholdQuery.data.owners.length,
      threshold: ownersAndThresholdQuery.data.threshold,
    });
    flushMiradorTrace(trace);
  }, [activeChainId, flowState, ownersAndThresholdQuery.data, safeAddress]);

  const signedOwnersSet = useMemo(
    () => new Set(safeMessageStatusQuery.data?.signedOwners ?? []),
    [safeMessageStatusQuery.data?.signedOwners]
  );

  const signedCount = signedOwnersSet.size;

  useEffect(() => {
    if (!flowState?.messageHash) {
      return;
    }

    if (lastSignedCountRef.current === signedCount) {
      return;
    }

    lastSignedCountRef.current = signedCount;
    const trace = startOrResumeProposalCreationTrace({
      branch: "safe_offchain_draft",
      walletAddress: safeAddress,
      chainId: activeChainId,
    });
    addMiradorEvent(trace, "safe_offchain_confirmation_progress", {
      messageHash: flowState.messageHash,
      signedCount,
      threshold: ownersAndThresholdQuery.data?.threshold,
    });
    if (
      ownersAndThresholdQuery.data?.threshold &&
      signedCount >= ownersAndThresholdQuery.data.threshold
    ) {
      addMiradorEvent(trace, "safe_offchain_all_signatures_collected", {
        messageHash: flowState.messageHash,
      });
    }
    flushMiradorTrace(trace);
  }, [
    activeChainId,
    flowState?.messageHash,
    ownersAndThresholdQuery.data?.threshold,
    safeAddress,
    signedCount,
  ]);

  const ownerRows = useMemo(() => {
    const owners = ownersAndThresholdQuery.data?.owners ?? [];

    return owners.map((owner) => ({
      owner,
      signed: signedOwnersSet.has(owner),
    }));
  }, [ownersAndThresholdQuery.data?.owners, signedOwnersSet]);

  const remainingMs = flowState?.expiresAt
    ? Math.max(0, flowState.expiresAt - now)
    : SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS;
  const isProgressScreen = Boolean(flowState);
  const isExpired = flowState?.status === "expired";
  const isFailed = flowState?.status === "failed";
  const progressTitle =
    flowState?.status === "pending_wallet"
      ? "Open Safe and start signing"
      : flowState?.status === "waiting_for_signatures"
      ? "Waiting for Safe confirmations"
      : flowState?.status === "verifying"
      ? "Verifying Safe signature"
      : "Creating draft";

  const progressDescription =
    flowState?.status === "pending_wallet"
      ? "Approve the Safe signing request to create the offchain SIWE message."
      : flowState?.status === "waiting_for_signatures"
      ? "Keep this page open while the remaining Safe owners approve the message."
      : flowState?.status === "verifying"
      ? "All required Safe signatures were collected. Agora is verifying the SIWE message."
      : "The SIWE check passed. Agora is creating your draft now.";

  return (
    <div className="flex w-full max-w-[40rem] flex-col gap-6">
      {!isProgressScreen ? (
        <>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-primary">
              Safe wallet detected
            </h2>
            <p className="text-secondary">
              Creating a draft offchain uses a Safe message signature flow before
              the proposal is submitted onchain.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Warning</p>
            <p className="mt-2">
              Creating a draft offchain requires all Safe signers to approve
              within 3 minutes. Stay on this page and do not switch tabs until
              the flow is complete.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-line"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            <span>I understand the risks of the offchain Safe signature flow.</span>
          </label>

          <div className="flex flex-col gap-3">
            <UpdatedButton
              onClick={() => void handleCreateDraftOffchain()}
              isLoading={pendingAction === "offchain"}
              disabled={!acknowledged || pendingAction !== null}
              type="primary"
            >
              Create Draft Offchain Quickly
            </UpdatedButton>

            <UpdatedButton
              onClick={() => void handleSkipToOnchain()}
              isLoading={pendingAction === "onchain"}
              disabled={pendingAction !== null}
              type="secondary"
            >
              Skip and Go Direct to Onchain
            </UpdatedButton>

            <Button
              onClick={() => void handleCloseChoiceScreen()}
              variant="outline"
              disabled={pendingAction !== null}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : isExpired || isFailed ? (
        <>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-primary">
              {isExpired ? "Safe signing timed out" : "Safe signing failed"}
            </h2>
            <p className="text-secondary">
              {flowState?.errorMessage ??
                "This offchain Safe flow did not complete successfully."}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-muted p-4 text-sm text-secondary">
            <p className="font-semibold text-primary">
              Safe: {shortAddress(safeAddress)}
            </p>
            {flowState?.messageHash ? (
              <p className="mt-2 break-all">Message hash: {flowState.messageHash}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <UpdatedButton onClick={() => void handleStartOver()} type="primary">
              Start Over
            </UpdatedButton>
            <UpdatedButton onClick={() => void handleSkipToOnchain()} type="secondary">
              Skip and Go Direct to Onchain
            </UpdatedButton>
            <Button
              onClick={() => {
                resetOffchainUi();
                closeDialog();
              }}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-primary">{progressTitle}</h2>
              <p className="text-secondary">{progressDescription}</p>
            </div>
            <div className="rounded-xl border border-line bg-muted px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-secondary">
                Time Remaining
              </p>
              <p className="text-2xl font-bold text-primary">
                {flowState?.expiresAt ? formatCountdown(remainingMs) : "--:--"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-neutral p-4">
              <p className="text-xs uppercase tracking-wide text-secondary">
                Safe Threshold
              </p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {ownersAndThresholdQuery.data?.threshold ?? "--"}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-neutral p-4">
              <p className="text-xs uppercase tracking-wide text-secondary">
                Signers Collected
              </p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {signedCount}/
                {ownersAndThresholdQuery.data?.threshold ?? ownersAndThresholdQuery.data?.owners.length ?? "--"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-neutral p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-primary">Safe owners</p>
                <p className="text-sm text-secondary">
                  {safeMessageStatusQuery.data === null && flowState?.messageHash
                    ? "Waiting for Safe to register the message."
                    : "Signer progress updates every few seconds."}
                </p>
              </div>
              {ownersAndThresholdQuery.isLoading ? (
                <span className="text-sm text-secondary">Loading owners...</span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {ownerRows.length > 0 ? (
                ownerRows.map(({ owner, signed }) => (
                  <div
                    key={owner}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
                  >
                    <span className="font-mono text-sm text-primary">
                      {shortAddress(owner)}
                    </span>
                    <span
                      className={
                        signed
                          ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700"
                      }
                    >
                      {signed ? "Signed" : "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-line px-3 py-4 text-sm text-secondary">
                  {ownersAndThresholdQuery.isError
                    ? "Unable to load Safe owners and threshold."
                    : "Waiting for Safe owner details."}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-muted p-4 text-sm text-secondary">
            <p className="font-semibold text-primary">Safe message</p>
            <p className="mt-2 break-all">
              {flowState?.messageHash ?? "Preparing Safe message hash..."}
            </p>
          </div>

          <Button
            onClick={() =>
              void cancelActiveFlow(
                "safe_offchain_cancelled",
                "User cancelled the Safe offchain signing flow.",
                "safe_offchain_cancelled",
                { close: true }
              )
            }
            variant="outline"
            disabled={flowState?.status === "draft_creating"}
          >
            Cancel flow
          </Button>
        </>
      )}
    </div>
  );
}
