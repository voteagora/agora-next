"use client";

import { useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import {
  DraftProposal,
  ProposalScope,
  ProposalType,
} from "../../../proposals/draft/types";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { getPublicClient } from "@/lib/viem";
import { generateProposalId } from "@/lib/seatbelt/simulate";
import { createProposalAttestation } from "@/lib/eas";
import toast from "react-hot-toast";

const OffchainProposalAction = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);
  const [offchainSubmitError, setOffchainSubmitError] = useState<string | null>(
    null
  );
  const [isOffchainSubmitting, setIsOffchainSubmitting] = useState(false);
  const proposal_scope = draftProposal.proposal_scope;
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  const governorContract = contracts.governor;

  const { data: votingDelay } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingDelay",
    chainId: contracts.governor.chain.id,
  });

  const { data: votingPeriod } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "votingPeriod",
    chainId: contracts.governor.chain.id,
  });

  async function submitOffchainProposal() {
    if (!address || !walletClient || !chain) {
      setOffchainSubmitError(
        "Wallet not connected or chain information is missing."
      );
      return;
    }
    setIsOffchainSubmitting(true);
    setOffchainSubmitError(null);

    try {
      const network = {
        chainId: chain.id,
        name: chain.name,
      };
      const provider = new BrowserProvider(walletClient.transport, network);
      const signer = new JsonRpcSigner(provider, address);

      const fullDescription =
        "# " + draftProposal.title + "\n" + draftProposal.abstract;
      const choices =
        draftProposal.voting_module_type === ProposalType.APPROVAL
          ? draftProposal.approval_options.map((option) => option.title)
          : [];

      const latestBlock = await getPublicClient().getBlockNumber();

      const startBlock = latestBlock + BigInt((votingDelay as any) ?? 0);
      const endBlock = startBlock + BigInt((votingPeriod as any) ?? 0);

      const tiersEnabled =
        (draftProposal.tiers?.length ?? 0) > 0 &&
        draftProposal.voting_module_type === ProposalType.OPTIMISTIC &&
        draftProposal.proposal_scope !== ProposalScope.ONCHAIN_ONLY;

      const parsedProposalType = tiersEnabled
        ? "OPTIMISTIC_TIERED"
        : draftProposal.voting_module_type === ProposalType.BASIC
          ? ("STANDARD" as ProposalType)
          : (draftProposal.voting_module_type?.toUpperCase() as ProposalType);

      const rawProposalDataForBackend = {
        proposer: address,
        description: fullDescription,
        choices: choices,
        proposal_type_id: Number(draftProposal.proposal_type),
        start_block: startBlock,
        end_block: endBlock,
        proposal_type: parsedProposalType,
        tiers: tiersEnabled ? draftProposal.tiers : [],
      };

      let onchainProposalId: bigint | null = null;

      const proposalType = draftProposal.voting_module_type.toLowerCase() as
        | "basic"
        | "approval"
        | "optimistic";
      const targets =
        proposalType === "basic" ? (inputData?.[0] as string[]) : [];
      const values =
        proposalType === "basic"
          ? (inputData?.[1] as number[]).map(BigInt)
          : [];
      const calldatas =
        proposalType === "basic" ? (inputData?.[2] as string[]) : [];
      const description =
        proposalType === "basic"
          ? (inputData?.[3] as string)
          : (inputData?.[2] as string);
      const moduleAddress =
        proposalType !== "basic" ? (inputData?.[0] as string) : undefined;
      const unformattedProposalData =
        proposalType !== "basic" ? (inputData?.[1] as string) : undefined;
      const offchainOnly =
        draftProposal.proposal_scope === ProposalScope.OFFCHAIN_ONLY;

      if (!offchainOnly) {
        onchainProposalId = await generateProposalId({
          targets,
          values,
          calldatas,
          description,
          proposalType,
          unformattedProposalData,
          moduleAddress,
        });
      }

      const { id, transactionHash } = await createProposalAttestation({
        contract: governorContract.address as `0x${string}`,
        proposer: rawProposalDataForBackend.proposer,
        description: rawProposalDataForBackend.description,
        choices: rawProposalDataForBackend.choices,
        proposal_type_id: rawProposalDataForBackend.proposal_type_id,
        start_block: rawProposalDataForBackend.start_block.toString(),
        end_block: rawProposalDataForBackend.end_block.toString(),
        proposal_type: parsedProposalType,
        tiers: rawProposalDataForBackend.tiers,
        signer: signer,
        onchain_proposalid: onchainProposalId,
      });

      const apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;

      if (!apiKey) {
        throw new Error("AGORA_API_KEY is not set");
      }

      const response = await fetch("/api/offchain-proposals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          proposalData: {
            proposer: rawProposalDataForBackend.proposer,
            description: rawProposalDataForBackend.description,
            choices: rawProposalDataForBackend.choices,
            proposal_type_id: rawProposalDataForBackend.proposal_type_id,
            start_block: rawProposalDataForBackend.start_block.toString(),
            end_block: rawProposalDataForBackend.end_block.toString(),
            proposal_type: rawProposalDataForBackend.proposal_type,
            tiers: rawProposalDataForBackend.tiers,
          },
          id: id.toString(),
          transactionHash,
          onchainProposalId: onchainProposalId?.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        toast.error(errorData.message || `API Error: ${response.status}`);
      } else {
        toast.success("Proposal submitted successfully");
        openDialog({
          type: "SPONSOR_OFFCHAIN_DRAFT_PROPOSAL",
          params: {
            redirectUrl: "/",
            txHash: transactionHash as `0x${string}`,
          },
        });
        await sponsorDraftProposal({
          draftProposalId: draftProposal.id,
          onchain_transaction_hash: transactionHash,
        });
        trackEvent({
          event_name: ANALYTICS_EVENT_NAMES.CREATE_OFFCHAIN_PROPOSAL,
          event_data: {
            proposal_id: id.toString(),
          },
        });
      }
    } catch (e: any) {
      console.error("Off-chain proposal submission error:", e);
      setOffchainSubmitError(
        e.message || "Failed to submit off-chain proposal."
      );
      toast.error(e.message || "Failed to submit off-chain proposal.");
    } finally {
      setIsOffchainSubmitting(false);
    }
  }

  return (
    <>
      <UpdatedButton
        fullWidth={true}
        type="primary"
        onClick={async () => {
          try {
            await submitOffchainProposal();
          } catch (error) {
            console.log(error);
          }
        }}
      >
        {isOffchainSubmitting ? "Submitting..." : "Submit offchain proposal"}
      </UpdatedButton>

      {offchainSubmitError && (
        <div className="p-4 border border-negative bg-negative/10 rounded mt-4 text-sm text-negative break-words hyphens-auto">
          {offchainSubmitError}
        </div>
      )}
    </>
  );
};

export default OffchainProposalAction;
