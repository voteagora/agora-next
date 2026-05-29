"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, AlertTriangle, ArrowRight } from "lucide-react";
import { useSIWE } from "connectkit";
import toast from "react-hot-toast";

import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  closeStoredProposalCreationTrace,
  markProposalCreationBranch,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import { addMiradorEvent, flushMiradorTrace } from "@/lib/mirador/webTrace";
import {
  isSafeProposalFlowSupported,
  UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE,
} from "@/lib/safeChains";
import { clearStoredSafeOffchainSigningState } from "@/lib/safeOffchainFlow";
import {
  isSafeOffchainMessageTrackingEnabled,
  SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE,
} from "@/lib/safeFeatures";
import { getStoredSiweJwt, waitForStoredSiweJwt } from "@/lib/siweSession";

type SafeProposalChoiceDialogProps = {
  closeDialog: () => void;
  safeAddress: `0x${string}`;
  chainId?: number;
  isSafeWallet: boolean;
  onCreateDraftProposal?: () => Promise<void>;
  onAuthenticated?: (jwt: string) => Promise<void> | void;
};

export function SafeProposalChoiceDialog({
  closeDialog,
  safeAddress,
  chainId,
  isSafeWallet,
  onCreateDraftProposal,
  onAuthenticated,
}: SafeProposalChoiceDialogProps) {
  const router = useRouter();
  const { signIn } = useSIWE();
  const openDialog = useOpenDialog();
  const [acknowledged, setAcknowledged] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "offchain" | "onchain" | null
  >(null);
  const isMountedRef = useRef(true);
  const hasExistingSiweSession = Boolean(
    getStoredSiweJwt({ expectedAddress: safeAddress })
  );
  const needsSafeSigningWarning = isSafeWallet && !hasExistingSiweSession;
  const safeOffchainTrackingEnabled = isSafeOffchainMessageTrackingEnabled();
  const safeProposalFlowsSupported =
    !isSafeWallet ||
    (typeof chainId === "number" && isSafeProposalFlowSupported(chainId));
  const safeDraftOffchainSupported =
    !needsSafeSigningWarning || safeProposalFlowsSupported;
  const safeDraftRequirementsLabel = safeOffchainTrackingEnabled
    ? "I understand the Safe draft signing flow requirements"
    : "I understand Agora will not track the Safe sign-in flow and I need to finish approvals in Safe quickly";

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const goDirectOnchain = async () => {
    if (!isSafeWallet) {
      closeDialog();
      router.push("/proposals/create-proposal");
      return;
    }

    if (!safeProposalFlowsSupported) {
      return;
    }

    clearStoredSafeOffchainSigningState();
    const trace = startOrResumeProposalCreationTrace({
      walletAddress: safeAddress,
      chainId,
    });
    addMiradorEvent(trace, "safe_proposal_choice_direct_onchain_selected");
    flushMiradorTrace(trace);

    await markProposalCreationBranch("safe_direct_onchain", trace, {
      walletAddress: safeAddress,
      chainId,
      safeAddress,
    });

    closeDialog();
    router.push("/proposals/create-proposal");
  };

  const handleCloseChoiceScreen = async () => {
    if (!isSafeWallet) {
      closeDialog();
      return;
    }

    await closeStoredProposalCreationTrace({
      eventName: "safe_proposal_choice_cancelled",
      details: "User closed the Safe proposal choice dialog.",
      reason: "safe_proposal_choice_cancelled",
    });
    closeDialog();
  };

  const handleSkipToOnchain = async () => {
    setPendingAction("onchain");

    try {
      await goDirectOnchain();
    } finally {
      if (isMountedRef.current) {
        setPendingAction(null);
      }
    }
  };

  const handleCreateDraftOffchain = async () => {
    if (!isSafeWallet) {
      if (!onCreateDraftProposal) {
        return;
      }

      setPendingAction("offchain");
      try {
        closeDialog();
        await onCreateDraftProposal();
      } finally {
        if (isMountedRef.current) {
          setPendingAction(null);
        }
      }
      return;
    }

    if (!onAuthenticated) {
      return;
    }

    if (!safeProposalFlowsSupported) {
      return;
    }

    setPendingAction("offchain");

    try {
      const jwt = getStoredSiweJwt({ expectedAddress: safeAddress });
      if (jwt) {
        const trace = startOrResumeProposalCreationTrace({
          walletAddress: safeAddress,
          chainId,
        });
        addMiradorEvent(trace, "safe_proposal_choice_offchain_selected");
        addMiradorEvent(trace, "siwe_session_reused");
        flushMiradorTrace(trace);

        await markProposalCreationBranch("safe_offchain_draft", trace, {
          walletAddress: safeAddress,
          chainId,
          safeAddress,
        });
        clearStoredSafeOffchainSigningState();

        try {
          await onAuthenticated(jwt);
          closeDialog();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to create draft";
          toast(message);
        }

        return;
      }

      const trace = startOrResumeProposalCreationTrace({
        walletAddress: safeAddress,
        chainId,
      });
      addMiradorEvent(trace, "safe_proposal_choice_offchain_selected");
      flushMiradorTrace(trace);

      await markProposalCreationBranch("safe_offchain_draft", trace, {
        walletAddress: safeAddress,
        chainId,
        safeAddress,
      });

      clearStoredSafeOffchainSigningState();

      if (!safeOffchainTrackingEnabled) {
        let signInResult: Awaited<ReturnType<typeof signIn>>;
        try {
          signInResult = await signIn();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Safe sign-in was cancelled or failed.";
          await closeStoredProposalCreationTrace({
            eventName: "safe_offchain_signing_failed",
            details: { message, signingKind: "siwe" },
            reason: "safe_offchain_signing_failed",
          });
          toast(message);
          return;
        }

        if (signInResult === false) {
          await closeStoredProposalCreationTrace({
            eventName: "safe_offchain_signing_cancelled",
            details: { signingKind: "siwe", reason: "cancelled" },
            reason: "safe_offchain_signing_cancelled",
          });
          toast("Safe sign-in was cancelled or failed.");
          return;
        }

        const safeJwt = await waitForStoredSiweJwt({
          expectedAddress: safeAddress,
        });
        if (!safeJwt) {
          await closeStoredProposalCreationTrace({
            eventName: "safe_offchain_signing_failed",
            details: {
              message:
                "Safe sign-in did not complete before Agora could read the session.",
              signingKind: "siwe",
            },
            reason: "safe_offchain_signing_failed",
          });
          toast("Safe sign-in took too long. Please try again.");
          return;
        }

        try {
          await onAuthenticated(safeJwt);
          closeDialog();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to create draft";
          await closeStoredProposalCreationTrace({
            eventName: "safe_offchain_signing_failed",
            details: { message, signingKind: "siwe" },
            reason: "safe_offchain_signing_failed",
          });
          toast(message);
        }

        return;
      }

      openDialog({
        type: "SAFE_OFFCHAIN_SIGNING",
        className: "sm:w-[42rem]",
        disableDismiss: true,
        params: {
          safeAddress,
          chainId,
          purpose: "proposal_draft",
          signingKind: "siwe",
          onAuthenticated,
          secondaryAction: {
            label: "Go Direct Onchain",
            onAction: goDirectOnchain,
          },
        },
      });
    } finally {
      if (isMountedRef.current) {
        setPendingAction(null);
      }
    }
  };

  return (
    <div className="flex w-full max-w-[40rem] flex-col gap-6">
      <div className="flex flex-col items-center justify-center gap-4 text-center pb-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {needsSafeSigningWarning
              ? "Safe Wallet Detected"
              : "Choose Proposal Flow"}
          </h2>
          <p className="text-secondary max-w-[24rem]">
            {needsSafeSigningWarning
              ? "Creating a draft offchain requires a Safe signature flow before Agora can create the draft."
              : "Choose whether to go straight to onchain proposal creation or start with the offchain draft flow."}
          </p>
        </div>
      </div>

      {needsSafeSigningWarning ? (
        <>
          <div
            className={
              safeProposalFlowsSupported
                ? safeOffchainTrackingEnabled
                  ? "rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 shadow-sm"
                  : "rounded-xl border border-line bg-muted/40 p-4 shadow-sm"
                : "rounded-xl border border-negative/30 bg-negative/5 p-4 shadow-sm"
            }
          >
            <div className="flex gap-3">
              <AlertTriangle
                className={
                  safeProposalFlowsSupported
                    ? safeOffchainTrackingEnabled
                      ? "h-5 w-5 flex-shrink-0 text-amber-600"
                      : "h-5 w-5 flex-shrink-0 text-secondary"
                    : "h-5 w-5 flex-shrink-0 text-negative"
                }
              />
              <div className="flex flex-col gap-1">
                <p
                  className={
                    safeProposalFlowsSupported
                      ? safeOffchainTrackingEnabled
                        ? "text-sm font-semibold text-amber-900"
                        : "text-sm font-semibold text-primary"
                      : "text-sm font-semibold text-negative"
                  }
                >
                  {safeProposalFlowsSupported
                    ? safeOffchainTrackingEnabled
                      ? "Important Warning"
                      : "Limited Safe Draft Feedback"
                    : "Unsupported Chain"}
                </p>
                {safeProposalFlowsSupported ? (
                  <p
                    className={
                      safeOffchainTrackingEnabled
                        ? "text-sm text-amber-800/90 leading-relaxed"
                        : "text-sm text-secondary leading-relaxed"
                    }
                  >
                    {safeOffchainTrackingEnabled
                      ? "Creating a draft offchain requires the required Safe signer threshold to approve within 3 minutes. Keep this page open, and do not refresh or navigate away until the flow completes."
                      : `${SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE} Agora can still start the Safe sign-in request, but it will not show live signer progress. Keep this tab open and finish signature collection in Safe quickly.`}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-negative/90">
                    {UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE}
                  </p>
                )}
              </div>
            </div>
          </div>
          {safeDraftOffchainSupported ? (
            <label className="flex items-center gap-3 rounded-xl border border-line bg-muted/50 p-4 cursor-pointer transition-colors hover:bg-muted">
              <input
                type="checkbox"
                className="h-5 w-5 rounded-md border-line text-primary focus:ring-primary/20 cursor-pointer"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              <span className="text-sm font-medium text-primary select-none">
                {safeDraftRequirementsLabel}
              </span>
            </label>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-line bg-muted/40 p-4 shadow-sm">
          <div className="flex gap-3">
            <Wallet className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">
                Two ways to proceed
              </p>
              <p className="text-sm text-secondary leading-relaxed">
                Direct onchain takes you straight to proposal creation. The
                offchain draft flow creates a draft first so you can continue
                working from the draft page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <UpdatedButton
          onClick={() => void handleCreateDraftOffchain()}
          isLoading={pendingAction === "offchain"}
          disabled={
            (needsSafeSigningWarning &&
              (!safeDraftOffchainSupported || !acknowledged)) ||
            pendingAction !== null
          }
          type="primary"
          className="w-full text-base font-medium h-12 flex justify-center items-center"
        >
          Create Draft Offchain
        </UpdatedButton>

        <UpdatedButton
          onClick={() => void handleSkipToOnchain()}
          isLoading={pendingAction === "onchain"}
          disabled={
            pendingAction !== null ||
            (needsSafeSigningWarning && !safeProposalFlowsSupported)
          }
          type="secondary"
          className="w-full text-base font-medium h-12 flex justify-center items-center gap-2"
        >
          {needsSafeSigningWarning
            ? "Skip & Go Direct to Onchain"
            : "Go Direct Onchain"}
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
    </div>
  );
}

export default SafeProposalChoiceDialog;
