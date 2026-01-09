import { useAccount, useWalletClient } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { BrowserProvider } from "ethers";
import {
  createV2CreateProposalAttestation,
  createApprovalVoteAttestation,
  createOptimisticVoteAttestation,
  createVoteAttestation,
  EAS_VOTING_TYPE,
  EAS_APPROVAL_CRITERIA,
} from "@/lib/eas";
import Tenant from "@/lib/tenant/tenant";
import {
  EASVotingType,
  ApprovalCriteria,
  easVotingTypeToNumber,
  approvalCriteriaToNumber,
} from "@/app/create/types";

export function useEASV2() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { ui } = Tenant.current();

  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;

  const getSigner = async () => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    return await new BrowserProvider(walletClient.transport as any).getSigner();
  };

  // Basic proposal creation (standard voting type)
  const createProposalMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      startts,
      endts,
      tags,
      proposal_type_uid,
    }: {
      title: string;
      description: string;
      startts: bigint;
      endts: bigint;
      tags: string;
      proposal_type_uid?: string;
    }) => {
      if (!walletClient || !isEASV2Enabled) {
        throw new Error("EAS v2 not enabled or wallet not connected");
      }
      const signer = await getSigner();
      const result = await createV2CreateProposalAttestation({
        title,
        description,
        startts,
        endts,
        tags,
        proposal_type_uid,
        signer,
        votingType: "standard",
      });

      return result;
    },
  });

  // Extended proposal creation with voting type support
  const createProposalWithVotingTypeMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      startts,
      endts,
      tags,
      proposal_type_uid,
      votingType = "standard",
      choices = [],
      maxApprovals = 1,
      criteria = "threshold",
      criteriaValue = 0,
      budget = 0,
    }: {
      title: string;
      description: string;
      startts: bigint;
      endts: bigint;
      tags: string;
      proposal_type_uid?: string;
      votingType?: EASVotingType;
      choices?: string[];
      maxApprovals?: number;
      criteria?: ApprovalCriteria;
      criteriaValue?: number;
      budget?: number;
    }) => {
      if (!walletClient || !isEASV2Enabled) {
        throw new Error("EAS v2 not enabled or wallet not connected");
      }
      const signer = await getSigner();
      const result = await createV2CreateProposalAttestation({
        title,
        description,
        startts,
        endts,
        tags,
        proposal_type_uid,
        signer,
        votingType,
        choices,
        maxApprovals,
        criteria: approvalCriteriaToNumber[criteria],
        criteriaValue,
        budget,
      });

      return result;
    },
  });

  // Standard vote (for/against/abstain)
  const createStandardVoteMutation = useMutation({
    mutationFn: async ({
      choice,
      reason,
      proposalId,
    }: {
      choice: number; // 0 = against, 1 = for, 2 = abstain
      reason: string;
      proposalId: string;
    }) => {
      if (!walletClient || !isEASV2Enabled) {
        throw new Error("EAS v2 not enabled or wallet not connected");
      }
      const signer = await getSigner();
      const result = await createVoteAttestation({
        choice,
        reason,
        signer,
        proposalId,
      });

      return result;
    },
  });

  // Approval vote (multi-choice selection)
  const createApprovalVoteMutation = useMutation({
    mutationFn: async ({
      choices,
      reason,
      proposalId,
    }: {
      choices: number[]; // Array of selected option indices
      reason: string;
      proposalId: string;
    }) => {
      if (!walletClient || !isEASV2Enabled) {
        throw new Error("EAS v2 not enabled or wallet not connected");
      }
      const signer = await getSigner();
      const result = await createApprovalVoteAttestation({
        choices,
        reason,
        signer,
        proposalId,
      });

      return result;
    },
  });

  // Optimistic vote (veto)
  const createOptimisticVoteMutation = useMutation({
    mutationFn: async ({
      reason,
      proposalId,
    }: {
      reason: string;
      proposalId: string;
    }) => {
      if (!walletClient || !isEASV2Enabled) {
        throw new Error("EAS v2 not enabled or wallet not connected");
      }
      const signer = await getSigner();
      const result = await createOptimisticVoteAttestation({
        reason,
        signer,
        proposalId,
      });

      return result;
    },
  });

  return {
    isEASV2Enabled,
    address,
    // Proposal creation
    createProposal: createProposalMutation.mutateAsync,
    isCreatingProposal: createProposalMutation.isPending,
    createProposalWithVotingType:
      createProposalWithVotingTypeMutation.mutateAsync,
    isCreatingProposalWithVotingType:
      createProposalWithVotingTypeMutation.isPending,
    // Voting
    createStandardVote: createStandardVoteMutation.mutateAsync,
    isCreatingStandardVote: createStandardVoteMutation.isPending,
    createApprovalVote: createApprovalVoteMutation.mutateAsync,
    isCreatingApprovalVote: createApprovalVoteMutation.isPending,
    createOptimisticVote: createOptimisticVoteMutation.mutateAsync,
    isCreatingOptimisticVote: createOptimisticVoteMutation.isPending,
    // Constants for convenience
    EAS_VOTING_TYPE,
    EAS_APPROVAL_CRITERIA,
  };
}
