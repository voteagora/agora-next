import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BrowserProvider } from "ethers";
import {
  createV2CreateProposalAttestation,
  EAS_VOTING_TYPE,
  EAS_APPROVAL_CRITERIA,
} from "@/lib/eas";
import type { VoteAttestationParams } from "@/lib/easVote";
import {
  submitVoteAttestation,
  type VoteAttestationResult,
} from "@/lib/easVoteSubmit";
import Tenant from "@/lib/tenant/tenant";
import {
  EASVotingType,
  ApprovalCriteria,
  approvalCriteriaToNumber,
} from "@/app/create/types";
import { extractFailedEasTxContext } from "@/lib/easTxContext";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";
import { MiradorAttributeMap, MiradorFlow } from "@/lib/mirador/types";
import { getPublicClient } from "@/lib/viem";
import { getWalletTransactionReadinessError } from "@/lib/wallet/transactionReadiness";
import { getWalletAccountType } from "@/lib/wallet/walletType";

type TraceableEasResult = {
  txHash?: string;
  transactionHash?: string;
  chainId?: number;
  txInputData?: string;
  attestationUid?: string;
  attestationUID?: string;
  id?: string;
};

type RunMiradorTraceOptions<T extends TraceableEasResult> = {
  name: string;
  flow: MiradorFlow;
  step: string;
  tags: string[];
  attributes?: MiradorAttributeMap;
  txDetails: string;
  successEventName: string;
  failureEventName: string;
  successDetails?: (result: T) => Record<string, unknown>;
  action: () => Promise<T>;
  chainId?: number;
  proposalId?: string;
};

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** Vote params as passed by the UI; chain and recipient come from the tenant. */
type VoteParams = DistributiveOmit<
  VoteAttestationParams,
  "chainId" | "recipient"
>;

function getMiradorResultTxHash(
  result: TraceableEasResult
): string | undefined {
  return result.txHash ?? result.transactionHash;
}

function getMiradorAttestationId(
  result: TraceableEasResult
): string | undefined {
  return result.attestationUid ?? result.attestationUID ?? result.id;
}

export function useEASV2() {
  const { address, chainId: currentChainId, connector, status } = useAccount();
  const config = useConfig();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();
  const { ui, contracts } = Tenant.current();

  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;
  const targetChain = contracts.token.chain;

  const assertWalletReady = () => {
    if (!isEASV2Enabled) {
      throw new Error("EAS v2 not enabled or wallet not connected");
    }
    if (!address) {
      throw new Error("Wallet not connected");
    }
    const readinessError = getWalletTransactionReadinessError({
      connector,
      status,
    });
    if (readinessError) {
      throw readinessError;
    }
    return address;
  };

  const ensureTargetChain = async () => {
    if (currentChainId !== targetChain.id) {
      await switchChainAsync({ chainId: targetChain.id });
    }
  };

  // Proposal creation still goes through the eas-sdk / ethers signer path.
  const getSigner = async () => {
    assertWalletReady();
    await ensureTargetChain();
    const walletClient = await getWalletClient(config, {
      chainId: targetChain.id,
    });
    return await new BrowserProvider(walletClient.transport as any).getSigner();
  };

  const getWalletAccountTypeAttribute = async () => {
    if (!address) return "unknown";
    return getWalletAccountType(address, targetChain.id);
  };

  const castVote = async (
    voteParams: VoteParams
  ): Promise<VoteAttestationResult> => {
    const voter = assertWalletReady();

    const result = await submitVoteAttestation(
      {
        address: voter,
        currentChainId,
        targetChain,
        publicClient: getPublicClient(targetChain),
        switchChain: (chainId) => switchChainAsync({ chainId }),
        getWalletClient: (chainId) => getWalletClient(config, { chainId }),
      },
      {
        ...voteParams,
        chainId: targetChain.id,
        recipient: contracts.easRecipient,
      } as VoteAttestationParams
    );

    void queryClient.invalidateQueries({
      queryKey: ["userVotes", voteParams.proposalId, voter],
    });

    return result;
  };

  const voteSuccessDetails =
    (voteKind: string) => (result: VoteAttestationResult) => ({
      voteKind,
      transactionHash: getMiradorResultTxHash(result),
      attestationUid: result.attestationUid,
      confirmed: result.confirmed,
      preflight: result.preflight,
    });

  const runMiradorTrace = async <T extends TraceableEasResult>({
    name,
    flow,
    step,
    tags,
    attributes,
    txDetails,
    successEventName,
    failureEventName,
    successDetails,
    action,
    chainId = contracts.token.chain.id,
    proposalId,
  }: RunMiradorTraceOptions<T>): Promise<T> => {
    const trace = startFrontendMiradorFlowTrace({
      name,
      flow,
      step,
      context: {
        walletAddress: address,
        chainId,
        proposalId,
      },
      tags,
      attributes,
      startEventName:
        flow === MIRADOR_FLOW.proposalAttestation
          ? "proposal_attestation_started"
          : "governance_vote_started",
      startEventDetails: {
        proposalId,
        ...attributes,
      },
    });

    try {
      const result = await action();
      attachMiradorTransactionArtifacts(trace, {
        chainId: result.chainId ?? chainId,
        inputData: result.txInputData,
        submittedTxHash: getMiradorResultTxHash(result),
        submittedTxDetails: `Submitted ${txDetails.toLowerCase()}`,
      });
      void closeFrontendMiradorFlowTrace(trace, {
        reason: successEventName,
        eventName: successEventName,
        details: {
          proposalId,
          attestationUid: getMiradorAttestationId(result),
          txHash: getMiradorResultTxHash(result),
          ...(successDetails ? successDetails(result) : {}),
        },
      });
      return result;
    } catch (error) {
      const failedTxContext = extractFailedEasTxContext(error);
      attachMiradorTransactionArtifacts(trace, {
        chainId: failedTxContext.chainId ?? chainId,
        inputData: failedTxContext.txInputData,
        submittedTxHash: failedTxContext.txHash,
        submittedTxDetails: `Failed ${txDetails.toLowerCase()}`,
      });
      void closeFrontendMiradorFlowTrace(trace, {
        reason: failureEventName,
        eventName: failureEventName,
        details: {
          proposalId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  };

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
      return runMiradorTrace({
        name: "ProposalAttestation",
        flow: MIRADOR_FLOW.proposalAttestation,
        step: "proposal_attestation_submit",
        tags: ["governance", "proposal", "frontend", "eas"],
        attributes: {
          votingType: "standard",
          hasProposalTypeUid: Boolean(proposal_type_uid),
        },
        txDetails: "Proposal attestation transaction",
        successEventName: "proposal_attestation_succeeded",
        failureEventName: "proposal_attestation_failed",
        action: async () => {
          const signer = await getSigner();
          return createV2CreateProposalAttestation({
            title,
            description,
            startts,
            endts,
            tags,
            proposal_type_uid,
            signer,
            votingType: "standard",
          });
        },
      });
    },
  });

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
      return runMiradorTrace({
        name: "ProposalAttestation",
        flow: MIRADOR_FLOW.proposalAttestation,
        step: "proposal_attestation_submit",
        tags: ["governance", "proposal", "frontend", "eas"],
        attributes: {
          votingType,
          hasProposalTypeUid: Boolean(proposal_type_uid),
          choiceCount: choices.length,
          maxApprovals,
          criteria,
        },
        txDetails: "Proposal attestation transaction",
        successEventName: "proposal_attestation_succeeded",
        failureEventName: "proposal_attestation_failed",
        successDetails: (result) => ({
          votingType,
          attestationUid: getMiradorAttestationId(result),
        }),
        action: async () => {
          const signer = await getSigner();
          return createV2CreateProposalAttestation({
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
        },
      });
    },
  });

  const createStandardVoteMutation = useMutation({
    mutationFn: async ({
      choice,
      reason,
      proposalId,
    }: {
      choice: number;
      reason: string;
      proposalId: string;
    }) => {
      const walletAccountType = await getWalletAccountTypeAttribute();
      return runMiradorTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step: "eas_vote_submit",
        tags: ["governance", "vote", "frontend", "eas"],
        attributes: {
          voteKind: "eas_standard",
          choice,
          hasReason: Boolean(reason),
          walletAccountType,
        },
        txDetails: "EAS standard vote attestation transaction",
        successEventName: "governance_vote_succeeded",
        failureEventName: "governance_vote_failed",
        successDetails: voteSuccessDetails("eas_standard"),
        proposalId,
        action: () =>
          castVote({ kind: "standard", choice, reason, proposalId }),
      });
    },
  });

  const createApprovalVoteMutation = useMutation({
    mutationFn: async ({
      choices,
      reason,
      proposalId,
    }: {
      choices: number[];
      reason: string;
      proposalId: string;
    }) => {
      const walletAccountType = await getWalletAccountTypeAttribute();
      return runMiradorTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step: "eas_approval_vote_submit",
        tags: ["governance", "vote", "frontend", "eas"],
        attributes: {
          voteKind: "eas_approval",
          choiceCount: choices.length,
          hasReason: Boolean(reason),
          walletAccountType,
        },
        txDetails: "EAS approval vote attestation transaction",
        successEventName: "governance_vote_succeeded",
        failureEventName: "governance_vote_failed",
        successDetails: voteSuccessDetails("eas_approval"),
        proposalId,
        action: () =>
          castVote({ kind: "approval", choices, reason, proposalId }),
      });
    },
  });

  const createOptimisticVoteMutation = useMutation({
    mutationFn: async ({
      reason,
      proposalId,
    }: {
      reason: string;
      proposalId: string;
    }) => {
      const walletAccountType = await getWalletAccountTypeAttribute();
      return runMiradorTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step: "eas_optimistic_vote_submit",
        tags: ["governance", "vote", "frontend", "eas"],
        attributes: {
          voteKind: "eas_optimistic",
          hasReason: Boolean(reason),
          walletAccountType,
        },
        txDetails: "EAS optimistic vote attestation transaction",
        successEventName: "governance_vote_succeeded",
        failureEventName: "governance_vote_failed",
        successDetails: voteSuccessDetails("eas_optimistic"),
        proposalId,
        action: () => castVote({ kind: "optimistic", reason, proposalId }),
      });
    },
  });

  return {
    isEASV2Enabled,
    address,
    createProposal: createProposalMutation.mutateAsync,
    isCreatingProposal: createProposalMutation.isPending,
    createProposalWithVotingType:
      createProposalWithVotingTypeMutation.mutateAsync,
    isCreatingProposalWithVotingType:
      createProposalWithVotingTypeMutation.isPending,
    createStandardVote: createStandardVoteMutation.mutateAsync,
    isCreatingStandardVote: createStandardVoteMutation.isPending,
    createApprovalVote: createApprovalVoteMutation.mutateAsync,
    isCreatingApprovalVote: createApprovalVoteMutation.isPending,
    createOptimisticVote: createOptimisticVoteMutation.mutateAsync,
    isCreatingOptimisticVote: createOptimisticVoteMutation.isPending,
    EAS_VOTING_TYPE,
    EAS_APPROVAL_CRITERIA,
  };
}
