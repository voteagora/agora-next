import { formatUnits } from "ethers";
import { capitalizeFirstLetter } from "@/lib/utils";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";

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
  PASSED: "Passed",
  UNKNOWN: "Unknown",
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
  const proposalCancelledTime = toDate(
    proposal.cancel_event?.timestamp ?? proposal.cancel_event?.blocktime
  );
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
 * Extract quorum and approval threshold from proposal type
 * Returns percentages (0-100)
 */
export const extractThresholds = (
  proposalType: ArchiveListProposal["proposal_type"]
): { quorum: number; approvalThreshold: number } => {
  // Handle FixedProposalType (eas-oodao)
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

  // Handle RangeProposalType (eas-oodao) - use min values
  if (
    typeof proposalType === "object" &&
    proposalType !== null &&
    "max_quorum_pct" in proposalType
  ) {
    return {
      quorum: proposalType.min_quorum_pct / 100,
      approvalThreshold: proposalType.min_approval_threshold_pct / 100,
    };
  }

  // Handle number type (dao_node) or unknown - use defaults
  return {
    quorum: DEFAULT_QUORUM_PERCENT,
    approvalThreshold: DEFAULT_APPROVAL_THRESHOLD_PERCENT,
  };
};

export const deriveStatus = (
  proposal: ArchiveListProposal,
  decimals: number
): string => {
  // Check terminal states first
  if (proposal.cancel_event) {
    return "CANCELLED";
  } else if (proposal.execute_event) {
    return "EXECUTED";
  } else if (proposal.queue_event) {
    const queueEvent = proposal.queue_event;
    const queueTimestamp = Number(
      queueEvent?.timestamp ?? queueEvent?.blocktime ?? 0
    );
    //TODO: we should check for no onchain actions
    if (
      queueTimestamp > 0 &&
      Math.floor(Date.now() / 1000) - queueTimestamp > TEN_DAYS_IN_SECONDS
    ) {
      return "PASSED";
    }
    return "QUEUED";
  }

  // Check if proposal is still active
  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(proposal.end_blocktime) || 0;
  if (endTime > now) {
    return "ACTIVE";
  }

  // Voting has ended, determine outcome for standard proposals
  // Handle different data sources: EAS-OODAO vs standard
  const source = proposal.data_eng_properties?.source;
  const voteTotals =
    source === "eas-oodao"
      ? proposal.outcome?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotes = convertToNumber(voteTotals["1"], decimals);
  const againstVotes = convertToNumber(voteTotals["0"], decimals);
  const abstainVotes = convertToNumber(voteTotals["2"], decimals);

  // Extract thresholds from proposal type
  const thresholds = extractThresholds(proposal.proposal_type);

  // Calculate vote threshold percentage (for / (for + against))
  // Note: abstain is NOT included in threshold calculation, only for quorum
  const thresholdVotes = forVotes + againstVotes;
  const voteThresholdPercent =
    thresholdVotes > 0 ? (forVotes / thresholdVotes) * 100 : 0;

  // Check approval threshold
  const hasMetThresholdOrNoThreshold =
    voteThresholdPercent >= thresholds.approvalThreshold ||
    thresholds.approvalThreshold === 0;

  // Calculate quorum (for + abstain votes) - similar to getProposalCurrentQuorum
  const quorumForGovernor = forVotes + abstainVotes;

  // Check quorum - we always have the threshold from proposal_type
  // but need total voting power to calculate if it's met
  let quorumMet = true;

  if (proposal.total_voting_power_at_start) {
    // We have total voting power - calculate quorum percentage
    const totalPower = convertToNumber(
      proposal.total_voting_power_at_start,
      decimals
    );
    const quorumPercentage =
      totalPower > 0 ? (quorumForGovernor / totalPower) * 100 : 0;
    quorumMet = quorumPercentage >= thresholds.quorum;
  }
  // If total_voting_power_at_start is not available, we can't check quorum
  // This happens for proposals that haven't started voting yet
  // Default to true to avoid incorrectly marking as defeated

  // Proposal is defeated if:
  // 1. Quorum not met, OR
  // 2. For votes < Against votes, OR
  // 3. Approval threshold not met
  if (!quorumMet || forVotes < againstVotes || !hasMetThresholdOrNoThreshold) {
    return "DEFEATED";
  }

  // Succeeded if for > against
  if (forVotes > againstVotes) {
    return "SUCCEEDED";
  }

  return "FAILED";
};

export const formatArchiveTagLabel = (tag?: string | null): string | null => {
  if (!tag) {
    return null;
  }

  const normalized = tag.toLowerCase();
  if (normalized === "tempcheck" || normalized === "temp-check") {
    return "Temp Check";
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

export const deriveTypeLabel = (proposal: ArchiveListProposal): string => {
  const source = proposal.data_eng_properties?.source;

  if (source === "dao_node") {
    return formatVotingModuleName(proposal.voting_module_name);
  }

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
