"use client";

import { useRef, useState } from "react";
import { encodeFunctionData } from "viem";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useSimulateContract, useWriteContract } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { ApprovalProposal } from "@/app/proposals/draft/types";
import { parseError } from "../../draft/utils/stages";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";
import {
  handleDraftOnchainPublishResult,
  prepareDraftOnchainPublishTrace,
} from "./publishDraftProposalOnchain";
import { closeStoredProposalCreationTrace } from "@/lib/mirador/proposalCreationTrace";
import {
  isSafeProposalFlowSupported,
  UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE,
} from "@/lib/safeChains";
import { isSafeOnchainTransactionTrackingEnabled } from "@/lib/safeFeatures";
import type { SafeTrackedTransactionSummary } from "@/lib/safeTrackedTransactions";
import { isSafeWallet } from "@/lib/utils";
import { useSafeWalletStatus } from "@/hooks/useSafeWalletStatus";
import toast from "react-hot-toast";

const ApprovalProposalAction = ({
  draftProposal,
}: {
  draftProposal: ApprovalProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);
  const [proposalCreated, setProposalCreated] = useState(false);
  const discoveredSafePublishRef = useRef<SafeTrackedTransactionSummary | null>(
    null
  );
  const { address, chain } = useAccount();
  const { getAuthenticationData } = useProposalActionAuth();
  const safeWalletStatusQuery = useSafeWalletStatus({
    address: address as `0x${string}` | undefined,
    chainId: chain?.id ?? contracts.governor.chain.id,
    enabled: Boolean(address),
  });

  const {
    data: config,
    isError: onPrepareError,
    error,
  } = useSimulateContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposeWithModule",
    args: inputData as any,
    query: {
      enabled: !proposalCreated,
    },
  });

  console.log(error);
  const { writeContractAsync: writeAsync, isPending: isWriteLoading } =
    useWriteContract();

  return (
    <>
      <UpdatedButton
        isLoading={isWriteLoading}
        fullWidth={true}
        type={onPrepareError ? "disabled" : "primary"}
        onClick={async () => {
          try {
            const connectedChainId = chain?.id ?? contracts.governor.chain.id;
            const safeOnchainTrackingEnabled =
              isSafeOnchainTransactionTrackingEnabled();
            const encodedInputData = encodeFunctionData({
              abi: contracts.governor.abi,
              functionName: "proposeWithModule",
              args: inputData as never,
            });
            discoveredSafePublishRef.current = null;
            const safeWallet =
              typeof safeWalletStatusQuery.data === "boolean"
                ? safeWalletStatusQuery.data
                : await isSafeWallet(
                    address as `0x${string}`,
                    connectedChainId
                  );
            if (
              safeWallet &&
              !isSafeProposalFlowSupported(contracts.governor.chain.id)
            ) {
              toast.error(UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE);
              return;
            }

            await prepareDraftOnchainPublishTrace({
              address: address as `0x${string}`,
              chainId: contracts.governor.chain.id,
              functionName: "proposeWithModule",
              governorAbi: contracts.governor.abi,
              inputData,
              draftProposalId: draftProposal.id,
            });
            if (safeWallet && safeOnchainTrackingEnabled) {
              const auth = await getAuthenticationData({
                action: "trackSafeProposalPublish",
                creatorAddress: address,
                draftProposalId: draftProposal.id,
                timestamp: new Date().toISOString(),
              });
              if (!auth) {
                await closeStoredProposalCreationTrace({
                  eventName: "draft_onchain_publish_auth_cancelled",
                  details: { draftProposalId: draftProposal.id },
                  reason: "draft_onchain_publish_auth_cancelled",
                });
                return;
              }
              const createdAfter = Date.now();
              openDialog({
                type: "SAFE_ONCHAIN_PENDING",
                className: "sm:w-[34rem]",
                params: {
                  safeAddress: address as `0x${string}`,
                  chainId: contracts.governor.chain.id,
                  expectedTo: contracts.governor.address as `0x${string}`,
                  expectedData: encodedInputData,
                  createdAfter,
                  onTrackedTransactionDiscovered: (publish) => {
                    discoveredSafePublishRef.current = publish;
                    openDialog({
                      type: "SAFE_PROPOSAL_PUBLISH_STATUS",
                      className: "sm:w-[44rem]",
                      params: {
                        publish,
                      },
                    });
                  },
                },
              });
            }
            const data = await writeAsync?.(config!.request);
            if (!data) {
              // for dev
              console.log(error);
              if (!discoveredSafePublishRef.current) {
                openDialog(null);
              }
              await closeStoredProposalCreationTrace({
                eventName: "draft_onchain_publish_failed_missing_tx_hash",
                details: { draftProposalId: draftProposal.id },
                reason: "draft_onchain_publish_failed_missing_tx_hash",
              });
              return;
            }
            setProposalCreated(true);
            await handleDraftOnchainPublishResult({
              address: address as `0x${string}`,
              chainId: contracts.governor.chain.id,
              draftProposal,
              inputData,
              txHash: data,
              isSafeWallet: safeWallet,
              getAuthenticationData,
              openDialog,
            });
          } catch (error) {
            if (!discoveredSafePublishRef.current) {
              openDialog(null);
            }
            await closeStoredProposalCreationTrace({
              eventName: "draft_onchain_publish_failed_client",
              details: {
                draftProposalId: draftProposal.id,
                message:
                  error instanceof Error ? error.message : "Unknown error",
              },
              reason: "draft_onchain_publish_failed_client",
            });
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to submit proposal"
            );
          }
        }}
      >
        Submit proposal
      </UpdatedButton>
      {onPrepareError && (
        <div className="p-4 border border-negative bg-negative/10 rounded mt-4 text-sm text-negative break-words hyphens-auto">
          {parseError(error)}
        </div>
      )}
    </>
  );
};

export default ApprovalProposalAction;
