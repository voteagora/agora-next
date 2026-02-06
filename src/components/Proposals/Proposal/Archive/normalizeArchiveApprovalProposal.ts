import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  deriveStatus,
  deriveTimeStatus,
  STATUS_LABEL_MAP,
  toDate,
  safeBigInt,
  safeBigIntOrNull,
  deriveProposalTag,
  resolveArchiveThresholds,
} from "./archiveProposalUtils";
import { ARCHIVE_PROPOSAL_DEFAULTS } from "@/app/proposals/data/archiveDefaults";
import { ParsedProposalData, ParsedProposalResults } from "@/lib/proposalUtils";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";

type NormalizeArchiveProposalOptions = {
  namespace?: string | null;
  tokenDecimals?: number;
};

export function normalizeArchiveApprovalProposal(
  proposal: ArchiveListProposal,
  options: NormalizeArchiveProposalOptions = {}
): Proposal {
  const decimals = options.tokenDecimals ?? 18;
  const statusKey = deriveStatus(proposal, decimals);
  const normalizedStatusKey = STATUS_LABEL_MAP[statusKey]
    ? statusKey
    : "ACTIVE";

  const timeStatus = deriveTimeStatus(proposal, normalizedStatusKey);

  const createdTime =
    toDate(proposal.created_event?.blocktime) ||
    toDate(proposal.blocktime) ||
    timeStatus.proposalStartTime ||
    timeStatus.proposalEndTime ||
    null;
  const startTime = timeStatus.proposalStartTime || createdTime;
  const endTime = timeStatus.proposalEndTime || startTime;
  const queuedTime = toDate(proposal.queue_event?.blocktime) || null;

  const source = proposal.data_eng_properties?.source;

  const {
    quorumVotes: quorumValue,
    approvalThreshold: approvalThresholdValue,
    votableSupply: votableSupplyValue,
  } = resolveArchiveThresholds(proposal);

  const markdowntitle =
    typeof proposal.title === "string" && proposal.title.trim().length > 0
      ? proposal.title
      : ARCHIVE_PROPOSAL_DEFAULTS.title;

  const description =
    typeof proposal.description === "string" &&
    proposal.description.trim().length > 0
      ? proposal.description
      : ARCHIVE_PROPOSAL_DEFAULTS.description;

  const kwargs = proposal.kwargs || {};
  const choices = (kwargs.choices as string[]) || [];
  const maxApprovals =
    typeof kwargs.max_approvals === "number" ? kwargs.max_approvals : 1;
  const criteria = typeof kwargs.criteria === "number" ? kwargs.criteria : 1;
  const criteriaValue =
    typeof kwargs.criteria_value === "number" ? kwargs.criteria_value : 1;
  const budget = typeof kwargs.budget === "number" ? kwargs.budget : 0;

  const proposalData: ParsedProposalData["APPROVAL"]["kind"] = {
    options: choices.map((choice) => ({
      description: choice,
      budgetTokensSpent: null,
      targets: [] as string[],
      values: [] as string[],
      calldatas: [] as string[],
      functionArgsName: [] as {
        functionName: string;
        functionArgs: string[];
      }[],
    })),
    proposalSettings: {
      maxApprovals,
      criteria: criteria === 0 ? "THRESHOLD" : "TOP_CHOICES",
      criteriaValue: BigInt(criteriaValue),
      budgetToken: "",
      budgetAmount: BigInt(budget),
    },
  };

  // Parse vote data from outcome field
  const outcome = proposal.outcome as any;
  const tokenHolderVotes = outcome?.["token-holders"] || {};

  // Extract votes for each option
  const optionVotes = choices.map((_, index) => {
    const voteData = tokenHolderVotes[String(index)];
    if (voteData && typeof voteData === "object") {
      // Sum up all votes for this option
      const totalVotes = Object.values(voteData).reduce((sum: bigint, vote) => {
        return sum + safeBigInt(vote as string | number);
      }, 0n);
      return totalVotes;
    }
    return 0n;
  });

  // Calculate total for, against, abstain
  const totalFor = outcome?.["no-param"]?.["1"]
    ? BigInt(outcome["no-param"]["1"])
    : 0n;

  const proposalResults = {
    for: totalFor,
    against: 0n,
    abstain: 0n,
    options: choices.map((choice, index) => ({
      option: choice,
      votes: optionVotes[index] || 0n,
    })),
    criteria: criteria === 0 ? "THRESHOLD" : "TOP_CHOICES",
    criteriaValue: BigInt(criteriaValue),
  } as ParsedProposalResults["APPROVAL"]["kind"];

  const proposerEns =
    typeof proposal.proposer_ens === "string"
      ? proposal.proposer_ens
      : proposal.proposer_ens?.detail;
  const rawTag = Array.isArray(proposal.tags) ? proposal.tags[0] : undefined;

  const proposalTypeData =
    typeof proposal.proposal_type === "object" && proposal.proposal_type
      ? {
          proposal_type_id: Number(proposal.proposal_type.eas_uid || 0),
          name: proposal.proposal_type.name || "Approval",
          quorum: safeBigInt(proposal.proposal_type.quorum || 0),
          approval_threshold: safeBigInt(
            proposal.proposal_type.approval_threshold || 0
          ),
        }
      : null;

  const normalizedProposal: Proposal = {
    id: String(proposal.id),
    proposer:
      typeof proposal.proposer === "string"
        ? proposal.proposer.toLowerCase()
        : "",
    snapshotBlockNumber: Number(
      proposal.start_block ?? proposal.block_number ?? 0
    ),
    createdTime,
    startTime,
    startBlock: safeBigIntOrNull(proposal.start_block),
    endTime,
    endBlock: safeBigIntOrNull(proposal.end_block),
    cancelledTime:
      timeStatus.proposalCancelledTime ||
      toDate(proposal.delete_event?.attestation_time) ||
      null,
    executedTime:
      timeStatus.proposalExecutedTime ||
      toDate(proposal.execute_event?.blocktime) ||
      null,
    executedBlock: safeBigIntOrNull(proposal.execute_event?.block_number),
    queuedTime,
    markdowntitle,
    description,
    quorum: quorumValue,
    votableSupply: votableSupplyValue,
    approvalThreshold: BigInt(approvalThresholdValue),
    proposalData,
    unformattedProposalData: proposal.proposal_data
      ? proposal.proposal_data.startsWith("0x")
        ? (proposal.proposal_data as `0x${string}`)
        : (`0x${proposal.proposal_data}` as `0x${string}`)
      : null,
    proposalResults,
    proposalType: "APPROVAL",
    proposalTypeData,
    status: normalizedStatusKey as Proposal["status"],
    createdTransactionHash: null,
    cancelledTransactionHash: proposal.cancel_event?.transaction_hash ?? null,
    executedTransactionHash: proposal.execute_event?.transaction_hash ?? null,
    offchainProposalId: undefined,
    proposalTypeApproval: proposal.proposal_type_approval,
  };

  const archiveMetadata = {
    source,
    rawTag,
    proposalTypeName:
      typeof proposal.proposal_type === "object"
        ? proposal.proposal_type?.name
        : "Approval",
    proposalTypeTag: deriveProposalTag(proposal),
    proposerEns,
    rawProposalType: proposal.proposal_type,
    defaultProposalTypeRanges: proposal.default_proposal_type_ranges,
  };

  return {
    ...normalizedProposal,
    archiveMetadata,
  } as Proposal & { archiveMetadata: typeof archiveMetadata };
}
