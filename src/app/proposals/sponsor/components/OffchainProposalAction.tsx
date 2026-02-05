"use client";

import { useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import {
  DraftProposal,
  PLMConfig,
  ProposalScope,
  ProposalType,
} from "../../../proposals/draft/types";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { ProposalType as LibProposalType } from "@/lib/types.d";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { getPublicClient } from "@/lib/viem";
import { generateProposalId } from "@/lib/seatbelt/simulate";
import { createProposalAttestation } from "@/lib/eas";
import toast from "react-hot-toast";
import { createOffchainProposal } from "@/app/api/offchain-proposals/actions";

const { contracts, ui } = Tenant.current();
const plmToggle = ui.toggle("proposal-lifecycle");
const config = plmToggle?.config as PLMConfig;
const governorContract = contracts.governor;
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const OffchainProposalAction = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const openDialog = useOpenDialog();
  const { inputData } = getInputData(draftProposal);
  const [offchainSubmitError, setOffchainSubmitError] = useState<string | null>(
    null
  );
  const [isOffchainSubmitting, setIsOffchainSubmitting] = useState(false);
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { getAuthenticationData } = useProposalActionAuth();

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

    if (!address || !config.offchainProposalCreator?.includes(address)) {
      setOffchainSubmitError(
        "You are not authorized to submit offchain proposals."
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
        maxApprovals: draftProposal.max_options ?? 0,
        criteria: draftProposal.criteria
          ? draftProposal.criteria === "Threshold"
            ? 0
            : 1
          : 99,
        criteriaValue: draftProposal.criteria
          ? draftProposal.criteria === "Threshold"
            ? (draftProposal.threshold ?? 0)
            : (draftProposal.top_choices ?? 0)
          : 0,
        calculationOptions: draftProposal.calculationOptions,
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
        maxApprovals: rawProposalDataForBackend.maxApprovals,
        criteria: rawProposalDataForBackend.criteria,
        criteriaValue: rawProposalDataForBackend.criteriaValue,
        calculationOptions: rawProposalDataForBackend.calculationOptions ?? 0,
      });

      const result = await createOffchainProposal({
        proposalData: {
          proposer: rawProposalDataForBackend.proposer,
          description: rawProposalDataForBackend.description,
          choices: rawProposalDataForBackend.choices,
          proposal_type_id: rawProposalDataForBackend.proposal_type_id,
          start_block: rawProposalDataForBackend.start_block.toString(),
          end_block: rawProposalDataForBackend.end_block.toString(),
          proposal_type:
            rawProposalDataForBackend.proposal_type as LibProposalType,
          tiers: rawProposalDataForBackend.tiers,
          maxApprovals: rawProposalDataForBackend.maxApprovals,
          criteria: rawProposalDataForBackend.criteria,
          criteriaValue: rawProposalDataForBackend.criteriaValue,
          calculationOptions: rawProposalDataForBackend.calculationOptions ?? 0,
        },
        id: id.toString(),
        transactionHash,
        onchainProposalId: onchainProposalId?.toString() ?? null,
      });

      toast.success("Proposal submitted successfully");
      openDialog({
        type: "SPONSOR_OFFCHAIN_DRAFT_PROPOSAL",
        params: {
          redirectUrl: "/",
          txHash: transactionHash as `0x${string}`,
        },
      });
      const messagePayload = {
        action: "sponsorDraft",
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        timestamp: new Date().toISOString(),
      };

      const auth = await getAuthenticationData(messagePayload);
      if (!auth) throw new Error("Authentication failed");

      await sponsorDraftProposal({
        draftProposalId: draftProposal.id,
        onchain_transaction_hash: transactionHash,
        is_offchain_submission: true,
        proposal_scope: draftProposal.proposal_scope,
        creatorAddress: address as `0x${string}`,
        message: auth.message,
        signature: auth.signature,
        jwt: auth.jwt,
      });
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
