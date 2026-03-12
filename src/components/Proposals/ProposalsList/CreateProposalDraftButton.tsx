"use client";

import { useState, useEffect } from "react";
import classNames from "classnames";
import { useSIWE } from "connectkit";
import { useAccount } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { PLMConfig } from "@/app/proposals/draft/types";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getStoredSiweJwt, waitForStoredSiweJwt } from "@/lib/siweSession";
import { isSafeWallet } from "@/lib/utils";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  closeStoredProposalCreationTrace,
  getStoredProposalCreationTraceState,
  getProposalCreationTraceHeaders,
  persistProposalCreationTraceState,
  startFreshProposalCreationTrace,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import { addMiradorEvent, flushMiradorTrace } from "@/lib/mirador/webTrace";
import {
  clearStoredSafeProposalOffchainFlowState,
  getStoredSafeProposalOffchainFlowState,
  isSafeProposalOffchainFlowExpired,
  isSafeProposalOffchainFlowTerminal,
} from "@/lib/safeOffchainFlow";
import { clearStoredSiweSession } from "@/lib/siweSession";

const CreateProposalDraftButton = ({
  address,
  className,
}: {
  address: `0x${string}`;
  className?: string;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { getAuthenticationData } = useProposalActionAuth();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { signIn } = useSIWE();
  const { chain } = useAccount();
  const openDialog = useOpenDialog();
  const { ui } = Tenant.current();
  const protocolLevelCreateProposalButtonCheck = (
    ui.toggle("proposal-lifecycle")?.config as PLMConfig
  )?.protocolLevelCreateProposalButtonCheck;
  const safeProposalChoiceEnabled =
    ui.toggle("safe-proposal-choice")?.enabled === true;

  const { data: threshold } = useProposalThreshold({
    enabled: !!protocolLevelCreateProposalButtonCheck,
  });
  const { data: manager } = useManager({
    enabled: !!protocolLevelCreateProposalButtonCheck,
  });
  const { data: accountVotes } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: BigInt(0),
    enabled: !!address && !!protocolLevelCreateProposalButtonCheck,
  });

  // hydration issue fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const isLocalSafeProposalTestingEnabled =
    process.env.NEXT_PUBLIC_LOCAL_SAFE_PROPOSAL_TESTING === "true" &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  // Check if the account holder is the gov manager OR has enough VP such that they meet the proposal threshold.
  if (
    !isLocalSafeProposalTestingEnabled &&
    protocolLevelCreateProposalButtonCheck &&
    !(manager === address) &&
    !(accountVotes !== undefined && threshold !== undefined
      ? accountVotes >= threshold
      : false)
  ) {
    return null;
  }

  const createDraftProposal = async () => {
    setIsPending(true);

    try {
      let jwt = getStoredSiweJwt({ expectedAddress: address });
      if (!jwt) {
        try {
          await signIn();
          jwt = await waitForStoredSiweJwt({
            expectedAddress: address,
            timeoutMs: 10_000,
            intervalMs: 200,
          });
        } catch (error) {
          toast("Sign-in cancelled or failed. Please try again.");
          return;
        }

        if (!jwt) {
          toast("Session expired. Please sign in to continue.");
          return;
        }
      }

      const messagePayload = {
        action: "createDraft",
        creatorAddress: address,
        timestamp: new Date().toISOString(),
      };

      const auth = await getAuthenticationData(messagePayload);
      if (!auth) {
        return;
      }

      const res = await fetch("/api/v1/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth.jwt ? `Bearer ${auth.jwt}` : "",
        },
        body: JSON.stringify({
          creatorAddress: address,
          message: auth.message,
          signature: auth.signature,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = body?.message || "Failed to create draft";
        throw new Error(errMsg);
      }

      const proposal = await res.json();
      router.push(`/proposals/draft/${proposal.uuid}`);
    } catch (error) {
      console.error("Error creating draft proposal:", error);
      const message = (error as Error)?.message || "Error creating draft";
      toast(message);
    } finally {
      setIsPending(false);
    }
  };

  const createSafeDraftProposal = async (jwt: string) => {
    const shouldTrace =
      getStoredProposalCreationTraceState()?.branch === "safe_offchain_draft";
    const trace = shouldTrace
      ? startOrResumeProposalCreationTrace({
          branch: "safe_offchain_draft",
          walletAddress: address,
          chainId: chain?.id,
        })
      : null;
    addMiradorEvent(trace, "proposal_draft_create_requested");
    flushMiradorTrace(trace);

    const response = await fetch("/api/v1/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        ...(shouldTrace ? getProposalCreationTraceHeaders() : {}),
      },
      body: JSON.stringify({
        creatorAddress: address,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message =
        typeof body?.message === "string"
          ? body.message
          : "Failed to create draft";
      if (shouldTrace) {
        await closeStoredProposalCreationTrace({
          eventName: "proposal_draft_create_failed_client",
          details: { message, status: response.status },
          reason: "proposal_draft_create_failed",
        });
      }
      throw new Error(message);
    }

    const proposal = await response.json();
    if (shouldTrace) {
      await closeStoredProposalCreationTrace({
        eventName: "proposal_draft_created_client",
        details: { draftId: proposal.uuid },
        reason: "proposal_draft_created",
      });
    }
    router.push(`/proposals/draft/${proposal.uuid}`);
  };

  const openProposalChoiceDialog = async (isSafe: boolean) => {
    if (isSafe) {
      const previousSafeFlowState = getStoredSafeProposalOffchainFlowState();
      const existingJwt = getStoredSiweJwt({ expectedAddress: address });
      if (
        previousSafeFlowState?.safeAddress?.toLowerCase() ===
          address.toLowerCase() &&
        (isSafeProposalOffchainFlowTerminal(previousSafeFlowState) ||
          isSafeProposalOffchainFlowExpired(previousSafeFlowState))
      ) {
        if (!existingJwt) {
          clearStoredSiweSession();
        }
      }

      clearStoredSafeProposalOffchainFlowState();
      const storedTrace = getStoredProposalCreationTraceState();
      const storedSafeAddress =
        storedTrace?.safeAddress ?? storedTrace?.walletAddress;
      const shouldResumeTrace =
        storedSafeAddress?.toLowerCase() === address.toLowerCase() &&
        (typeof chain?.id !== "number" || storedTrace?.chainId === chain.id);

      const trace = shouldResumeTrace
        ? startOrResumeProposalCreationTrace({
            walletAddress: address,
            chainId: chain?.id,
          })
        : startFreshProposalCreationTrace({
            walletAddress: address,
            chainId: chain?.id,
          });

      if (trace) {
        addMiradorEvent(trace, "proposal_creation_clicked", {
          entrypoint: "create_proposal_button",
        });
        addMiradorEvent(trace, "safe_wallet_detected", {
          safeAddress: address,
        });
        addMiradorEvent(trace, "safe_proposal_choice_modal_opened");
        flushMiradorTrace(trace);

        await persistProposalCreationTraceState(trace, {
          walletAddress: address,
          chainId: chain?.id,
          safeAddress: address,
        });
      }
    }

    openDialog({
      type: "SAFE_PROPOSAL_CHOICE",
      className: "sm:w-[42rem]",
      disableDismiss: true,
      params: {
        safeAddress: address,
        chainId: chain?.id,
        isSafeWallet: isSafe,
        onCreateDraftProposal: isSafe ? undefined : createDraftProposal,
        onAuthenticated: isSafe ? createSafeDraftProposal : undefined,
      },
    });
  };

  return (
    <UpdatedButton
      variant="rounded"
      type="primary"
      isLoading={isPending}
      disabled={isPending}
      aria-busy={isPending}
      aria-disabled={isPending}
      className={classNames(className)}
      onClick={async () => {
        if (isPending) return;

        setIsPending(true);
        const isSafe = await isSafeWallet(address, chain?.id);

        if (safeProposalChoiceEnabled) {
          setIsPending(false);
          await openProposalChoiceDialog(isSafe);
          return;
        }

        if (isSafe) {
          setIsPending(false);
          router.push(`/proposals/create-proposal`);
          return;
        }

        await createDraftProposal();
      }}
    >
      Create proposal
    </UpdatedButton>
  );
};

export default CreateProposalDraftButton;
