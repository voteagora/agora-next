"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Wallet, AlertTriangle, CheckCircle2, Clock, ShieldAlert, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import {
  SIWE_NONCE_QUERY_KEY,
  SIWE_SESSION_QUERY_KEY,
  useSIWE,
} from "connectkit";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useEnsName } from "wagmi";

import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { useSafeMessageStatus } from "@/hooks/useSafeMessageStatus";
import { useSafeOwnersAndThreshold } from "@/hooks/useSafeOwnersAndThreshold";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
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
import { encodeSafeMessageConfirmations } from "@/lib/safeTransactionService";
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

function SignerProgress({ signed, threshold }: { signed: number; threshold: number }) {
  const radius = 40;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safeThreshold = threshold || 1;
  const progressPercent = Math.min(signed, safeThreshold) / safeThreshold;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform drop-shadow-md">
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-line opacity-30"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={signed >= safeThreshold ? "text-emerald-500" : "text-primary"}
        />
      </svg>
      <div className="absolute flex items-baseline justify-center gap-0.5">
        <span className="text-3xl font-extrabold text-primary tracking-tighter leading-none">{signed}</span>
        <span className="text-sm font-bold text-secondary opacity-50">/{safeThreshold}</span>
      </div>
    </div>
  );
}

function SafeOwnerRow({ owner, signed }: { owner: `0x${string}`; signed: boolean }) {
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: owner,
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ENSAvatar ensName={ensName ?? undefined} className="h-10 w-10 rounded-full ring-2 ring-neutral shadow-sm" size={40} />
          {signed && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 ring-2 ring-neutral z-10 shadow-sm animate-in zoom-in duration-300">
              <CheckCircle2 className="h-3 w-3" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-primary tracking-tight">
            <ENSName address={owner} />
          </span>
          <span className="text-[11px] text-secondary/60 font-mono tracking-wider mt-0.5">
            {shortAddress(owner)}
          </span>
        </div>
      </div>
      {signed ? (
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full ring-1 ring-inset ring-emerald-500/20">
          Signed
        </span>
      ) : (
        <span className="text-xs font-bold uppercase tracking-wider text-secondary/40 group-hover:text-secondary/70 transition-colors px-3 py-1.5">
          Pending
        </span>
      )}
    </div>
  );
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
  const manualVerifyStartedRef = useRef(false);
  const lastSignedCountRef = useRef<number | null>(null);
  const thresholdLoadedRef = useRef(false);
  const pathnameRef = useRef(pathname);

  const resetLocalProgressRefs = useCallback(() => {
    submitStartedRef.current = false;
    timeoutHandledRef.current = false;
    manualVerifyStartedRef.current = false;
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

      let signInResult: Awaited<ReturnType<typeof signIn>>;
      try {
        signInResult = await signIn();
      } catch (error) {
        const latestState = getStoredSafeProposalOffchainFlowState();
        if (
          latestState &&
          isSafeProposalOffchainFlowActive(latestState) &&
          latestState.status === "pending_wallet" &&
          !latestState.messageHash
        ) {
          setSafeProposalOffchainFlowStatus(
            "failed",
            error instanceof Error
              ? error.message
              : "Sign-in cancelled or failed."
          );
          await closeSafeProposalTrace(
            "safe_proposal_siwe_failed",
            {
              restarted: options?.restarted === true,
              message:
                error instanceof Error
                  ? error.message
                  : "Sign-in cancelled or failed.",
            },
            "safe_proposal_siwe_failed"
          );
          return;
        }

        throw error;
      }

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
        "safe_proposal_siwe_failed",
        {
          restarted: options?.restarted === true,
          message: "Sign-in cancelled or failed.",
        },
        "safe_proposal_siwe_failed"
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

  useEffect(() => {
    if (
      !flowState?.message ||
      !flowState.messageHash ||
      !ownersAndThresholdQuery.data?.threshold ||
      flowState.status === "verifying" ||
      flowState.status === "draft_creating" ||
      signedCount < ownersAndThresholdQuery.data.threshold ||
      manualVerifyStartedRef.current
    ) {
      return;
    }

    if (getStoredSiweJwt({ expectedAddress: safeAddress })) {
      return;
    }

    const encodedSignatures = encodeSafeMessageConfirmations(
      safeMessageStatusQuery.data?.confirmations ?? []
    );
    if (encodedSignatures === "0x") {
      return;
    }

    manualVerifyStartedRef.current = true;
    setSafeProposalOffchainFlowStatus("verifying");

    void siweProviderConfig
      .verifyMessage({
        message: flowState.message,
        signature: encodedSignatures,
      })
      .then((verified) => {
        if (!verified) {
          manualVerifyStartedRef.current = false;
        }
      })
      .catch(() => {
        manualVerifyStartedRef.current = false;
      });
  }, [
    flowState?.message,
    flowState?.messageHash,
    flowState?.status,
    ownersAndThresholdQuery.data?.threshold,
    safeAddress,
    safeMessageStatusQuery.data?.confirmations,
    signedCount,
  ]);

  const ownerRows = useMemo(() => {
    const owners = ownersAndThresholdQuery.data?.owners ?? [];

    return owners.map((owner) => ({
      owner,
      signed: signedOwnersSet.has(owner),
    }));
  }, [ownersAndThresholdQuery.data?.owners, signedOwnersSet]);
  const requiredSignersCount =
    ownersAndThresholdQuery.data?.threshold ??
    ownersAndThresholdQuery.data?.owners.length;
  const remainingRequiredSigners =
    typeof requiredSignersCount === "number"
      ? Math.max(0, requiredSignersCount - signedCount)
      : null;

  const remainingMs = flowState?.expiresAt
    ? Math.max(0, flowState.expiresAt - now)
    : SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS;
  const isProgressScreen = Boolean(flowState);
  const isExpired = flowState?.status === "expired";
  const isFailed = flowState?.status === "failed";
  const isDraftCreating = flowState?.status === "draft_creating";
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
          <div className="flex flex-col items-center justify-center gap-4 text-center pb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">
                Safe Wallet Detected
              </h2>
              <p className="text-secondary max-w-[24rem]">
                Creating a draft offchain requires a Safe message signature flow before
                the proposal is submitted onchain.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-amber-900">Important Warning</p>
                <p className="text-sm text-amber-800/90 leading-relaxed">
                  Creating a draft offchain requires all Safe signers to approve
                  within <span className="font-semibold">3 minutes</span>. Please stay on this page and do not switch tabs until the flow completes.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-line bg-muted/50 p-4 cursor-pointer transition-colors hover:bg-muted">
            <input
              type="checkbox"
              className="h-5 w-5 rounded-md border-line text-primary focus:ring-primary/20 cursor-pointer"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            <span className="text-sm font-medium text-primary select-none">
              I understand the risks of the offchain Safe signature flow
            </span>
          </label>

          <div className="flex flex-col gap-3 pt-2">
            <UpdatedButton
              onClick={() => void handleCreateDraftOffchain()}
              isLoading={pendingAction === "offchain"}
              disabled={!acknowledged || pendingAction !== null}
              type="primary"
              className="w-full text-base font-medium h-12 flex justify-center items-center"
            >
              Create Draft Offchain
            </UpdatedButton>

            <UpdatedButton
              onClick={() => void handleSkipToOnchain()}
              isLoading={pendingAction === "onchain"}
              disabled={pendingAction !== null}
              type="secondary"
              className="w-full text-base font-medium h-12 flex justify-center items-center gap-2"
            >
              Skip & Go Direct to Onchain
              <ArrowRight className="h-4 w-4" />
            </UpdatedButton>

            <Button
              onClick={() => void handleCloseChoiceScreen()}
              variant="ghost"
              disabled={pendingAction !== null}
              className="w-full text-secondary hover:text-primary h-12"
            >
              Cancel
            </Button>
          </div>
        </>
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
              {flowState?.errorMessage ?? "The offchain Safe signature flow could not be completed in time."}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-line bg-muted/30 p-5 shadow-inner text-left flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-secondary" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Safe Account</span>
                <span className="font-mono font-medium text-primary"><ENSName address={safeAddress} /></span>
              </div>
            </div>
            {flowState?.messageHash && (
              <>
                <div className="h-px w-full bg-line/50" />
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-secondary mt-0.5" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Message Hash</span>
                    <span className="break-all font-mono text-[11px] text-secondary/80 mt-1">{flowState.messageHash}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col w-full gap-3 pt-2">
            <UpdatedButton onClick={() => void handleStartOver()} type="primary" className="w-full text-base font-semibold h-14 rounded-xl shadow-lg">
              Try Again
            </UpdatedButton>
            <UpdatedButton onClick={() => void handleSkipToOnchain()} type="secondary" className="w-full text-base font-semibold h-14 rounded-xl group flex items-center justify-center gap-2">
              Go Direct Onchain
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </UpdatedButton>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => {
                  resetOffchainUi();
                  closeDialog();
                }}
                className="text-sm font-semibold text-secondary hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-muted"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : isDraftCreating ? (
        <div className="flex min-h-[28rem] flex-col items-center justify-center gap-8 text-center animate-in fade-in zoom-in duration-700 relative w-full">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] opacity-50 animate-pulse" />
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping ring-2 ring-primary/20 duration-1000" />
            <div className="absolute inset-[-10px] rounded-full animate-ping ring-1 ring-primary/10 duration-1000 delay-150" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/20 rotate-3">
              <Loader2 className="h-10 w-10 animate-spin text-neutral" />
            </div>
          </div>
          <div className="flex max-w-[22rem] flex-col gap-3 relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-primary bg-clip-text text-transparent bg-gradient-to-b from-primary to-primary/70">
              Finalizing Draft
            </h2>
            <p className="text-secondary/90 leading-relaxed text-base">
              Signatures verified successfully. Agora is securely storing your draft and will redirect you momentarily.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative w-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-[3xl] opacity-50 pointer-events-none animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[3xl] opacity-50 pointer-events-none animate-pulse delay-1000" />

          {/* Header Status */}
          <div className="flex flex-col items-center justify-center text-center gap-3 pb-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-semibold ring-1 ring-primary/10 mb-1 shadow-sm">
              {flowState?.status === "pending_wallet" && <Wallet className="h-4 w-4" />}
              {flowState?.status === "waiting_for_signatures" && <Loader2 className="h-4 w-4 animate-spin" />}
              {flowState?.status === "verifying" && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
              <span>{progressTitle}</span>
            </div>
            <p className="text-secondary max-w-[24rem] text-sm leading-relaxed">{progressDescription}</p>
          </div>

          {/* Main Stats Row */}
          <div className="flex gap-4 items-stretch justify-center relative z-10">
            {/* Circular Progress */}
            <div className="flex-1 rounded-3xl bg-neutral ring-1 ring-line shadow-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:ring-primary/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-5 z-10">Signatures</p>
              <SignerProgress signed={signedCount} threshold={ownersAndThresholdQuery.data?.threshold ?? 1} />
            </div>

            {/* Timer */}
            <div className="flex-1 rounded-3xl bg-neutral ring-1 ring-line shadow-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:ring-amber-500/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 z-10 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Time Left
              </p>
              <div className="flex items-baseline justify-center gap-1 z-10">
                <span className="font-mono text-5xl font-extrabold tracking-tighter text-primary">
                  {flowState?.expiresAt ? formatCountdown(remainingMs).split(':')[0] : "--"}
                </span>
                <span className="text-3xl font-bold text-secondary/30 animate-pulse pb-1">:</span>
                <span className="font-mono text-5xl font-extrabold tracking-tighter text-primary">
                  {flowState?.expiresAt ? formatCountdown(remainingMs).split(':')[1] : "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Owners List */}
          <div className="rounded-3xl bg-neutral ring-1 ring-line shadow-xl overflow-hidden flex flex-col relative z-10">
            <div className="bg-muted/30 px-6 py-4 border-b border-line flex justify-between items-center">
              <p className="text-sm font-bold text-primary tracking-tight">Safe Owners</p>
              {safeMessageStatusQuery.data === null && flowState?.messageHash ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Loader2 className="h-3 w-3 animate-spin" /> Pending API
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Status
                </span>
              )}
            </div>
            
            <div className="flex flex-col max-h-[16rem] overflow-y-auto custom-scrollbar p-2 gap-1">
              {ownerRows.length > 0 ? (
                ownerRows.map(({ owner, signed }) => (
                  <SafeOwnerRow key={owner} owner={owner as `0x${string}`} signed={signed} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Wallet className="h-10 w-10 text-secondary/20 mb-3" />
                  <p className="text-sm font-medium text-secondary">
                    {ownersAndThresholdQuery.isError ? "Error loading owners." : "Fetching owner details..."}
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
                  ? "Approve the Safe request to start the offchain sign-in flow for this draft."
                  : flowState?.status === "verifying"
                  ? "All required Safe signers have approved. Agora is validating the message now."
                  : "Agora is waiting for the remaining Safe approvals before it can create the draft."}
              </p>
              <div className="flex items-start gap-2 text-sm text-secondary">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  This step only authenticates the Safe so Agora can create a
                  draft. It does not submit a proposal onchain.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2 relative z-10">
            <button
              onClick={() =>
                void cancelActiveFlow(
                  "safe_offchain_cancelled",
                  "User cancelled the Safe offchain signing flow.",
                  "safe_offchain_cancelled",
                  { close: true }
                )
              }
              disabled={flowState?.status === "draft_creating"}
              className="text-sm font-semibold text-secondary hover:text-red-500 transition-colors py-2 px-4 rounded-lg hover:bg-red-500/10"
            >
              Cancel Signing Flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
