import { formatUnits } from "ethers";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  ArchiveListProposal,
  EasOodaoVoteOutcome,
} from "@/lib/types/archiveProposal";

/**
 * Shared utilities for normalizing archive proposals
 */

export const STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: "Active",
  SUCCEEDED: "Succeeded",
  EXECUTED: "Executed",
  DEFEATED: "Defeated",
  QUEUED: "Queued",
  CANCELLED: "Cancelled",
  PASSED: "Succeeded",
  UNKNOWN: "Unknown",
  PENDING: "Pending",
  EXPIRED: "Expired",
};

/**
 * Convert token amounts (with decimals) to regular numbers
 * Used for vote calculations and percentages
 */
export const convertToNumber = (
  amount: string | null | undefined,
  decimals: number
) => {
  if (!amount) return 0;
  try {
    return Number(formatUnits(amount, decimals));
  } catch {
    return 0;
  }
};

/**
 * Convert values to BigInt for blockchain data
 * Types guarantee these are string | number, so we can simplify
 */
export const safeBigInt = (
  value: string | number | undefined | null
): bigint => {
  if (!value) return 0n;
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
};

export const safeBigIntOrNull = (
  value: string | number | undefined | null
): bigint | null => {
  if (!value) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

export const toDate = (value: number | string | undefined | null) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return new Date(numeric * 1000);
};

export const deriveTimeStatus = (
  proposal: ArchiveListProposal,
  normalizedStatus: string
) => {
  const proposalStartTime = toDate(proposal.start_blocktime);
  const proposalEndTime = toDate(proposal.end_blocktime);
  const proposalCancelledTime = toDate(proposal.delete_event?.attestation_time);
  const proposalExecutedTime = toDate(
    proposal.execute_event?.timestamp ?? proposal.execute_event?.blocktime
  );

  return {
    proposalStatus: normalizedStatus,
    proposalStartTime,
    proposalEndTime,
    proposalCancelledTime,
    proposalExecutedTime,
  } as const;
};

const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;

// Default thresholds if not specified in proposal type
const DEFAULT_QUORUM_PERCENT = 4;
const DEFAULT_APPROVAL_THRESHOLD_PERCENT = 50;

/**
 * Extract quorum and approval threshold from proposal
 * If default_proposal_type_ranges exists, the proposal is pending approval (use min values)
 * Otherwise, use the fixed values from proposal_type
 * Returns percentages (0-100)
 */
export const extractThresholds = (
  proposal: ArchiveListProposal
): { quorum: number; approvalThreshold: number } => {
  const proposalType = proposal.proposal_type;
  const defaultProposalTypeRanges = proposal.default_proposal_type_ranges;

  // If default_proposal_type_ranges exists, proposal is pending approval - use min values
  if (
    defaultProposalTypeRanges &&
    typeof defaultProposalTypeRanges === "object"
  ) {
    return {
      quorum: defaultProposalTypeRanges.min_quorum_pct / 100,
      approvalThreshold:
        defaultProposalTypeRanges.min_approval_threshold_pct / 100,
    };
  }

  // Handle FixedProposalType (eas-oodao) - proposal type is approved
  if (
    typeof proposalType === "object" &&
    proposalType !== null &&
    "quorum" in proposalType
  ) {
    return {
      quorum: proposalType.quorum / 100, // Convert basis points to percentage
      approvalThreshold: proposalType.approval_threshold / 100,
    };
  }

  // Handle number type (dao_node) or unknown - use defaults
  return {
    quorum: DEFAULT_QUORUM_PERCENT,
    approvalThreshold: DEFAULT_APPROVAL_THRESHOLD_PERCENT,
  };
};

export const formatArchiveTagLabel = (tag?: string | null): string | null => {
  if (!tag) {
    return null;
  }

  const normalized = tag.toLowerCase();
  if (normalized === "tempcheck" || normalized === "temp-check") {
    return "Temp Check";
  }

  if (normalized === "gov-proposal" || normalized === "govproposal") {
    return "Gov Proposal";
  }

  return tag;
};

export const formatVotingModuleName = (name?: string | null): string => {
  if (!name) {
    return "Governance";
  }

  const cleaned = name.replace(/_/g, " ").trim();
  return cleaned ? capitalizeFirstLetter(cleaned) : "Governance";
};

export const deriveProposalTag = (proposal: ArchiveListProposal): string => {
  const rawTag = Array.isArray(proposal.tags) ? proposal.tags[0] : undefined;
  const formattedTag = formatArchiveTagLabel(rawTag);
  if (formattedTag) {
    return formattedTag;
  }

  if (rawTag) {
    return rawTag;
  }

  return "Governance";
};

export const resolveArchiveThresholds = (proposal: ArchiveListProposal) => {
  const source = proposal.data_eng_properties?.source;

  const resolveFromEas = () => {
    const type = proposal.proposal_type;
    if (!type || typeof type !== "object") {
      return {
        quorum: safeBigInt(0),
        approvalThreshold: safeBigInt(0),
      };
    }

    return {
      quorum: safeBigInt(type.quorum ?? 0),
      approvalThreshold: safeBigInt(type.approval_threshold ?? 0),
    };
  };

  const quotaValues =
    source === "eas-oodao"
      ? resolveFromEas()
      : {
          quorum: safeBigInt(proposal.quorum ?? proposal.quorumVotes ?? 0),
          approvalThreshold: safeBigInt(proposal.approval_threshold ?? 0),
        };

  const totalVotingPowerRaw = safeBigInt(
    proposal.total_voting_power_at_start ?? 0
  );

  let quorumValue = quotaValues.quorum / 100n;

  if (source === "eas-oodao" && quorumValue > 0n && totalVotingPowerRaw > 0n) {
    quorumValue = (totalVotingPowerRaw * quorumValue) / 100n;
  }

  const votableSupply = safeBigInt(proposal.total_voting_power_at_start ?? 0);

  return {
    quorum: quorumValue,
    approvalThreshold: quotaValues.approvalThreshold,
    votableSupply,
  };
};
