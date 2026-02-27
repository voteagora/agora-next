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
  PENDING: "Pending",
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

/**
 * Extract vote value from either flat string or nested object structure
 * For approval voting: { "1": "1000" } -> "1000"
 * For standard voting: "1000" -> "1000"
 */
export const extractVoteValue = (
  value: string | { [supportType: string]: string } | undefined
): string => {
  if (!value) return "0";
  if (typeof value === "string") return value;
  // For nested objects, extract the "1" key (for votes)
  if (typeof value === "object" && value["1"]) return value["1"];
  return "0";
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
 * Always uses proposal_type values (author's proposed or approved type)
 * Note: default_proposal_type_ranges is for display only, not status calculation
 * Returns values as percentages (0-100, e.g., 4 = 4%, 100 = 100%)
 */
export const extractThresholds = (
  proposal: ArchiveListProposal
): { quorum: number; approvalThreshold: number } => {
  const proposalType = proposal.proposal_type;

  // Handle FixedProposalType (eas-oodao) - both approved and pending proposals
  // Server sends these in basis points (e.g., 400 = 4%, 10000 = 100%)
  // Convert to percentage by dividing by 100
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

export const deriveStatus = (
  proposal: ArchiveListProposal,
  decimals: number
): string => {
  const { quorumVotes, approvalThreshold } = resolveArchiveThresholds(proposal);
  if (proposal.cancel_event || proposal.lifecycle_stage === "CANCELLED") {
    return "CANCELLED";
  } else if (proposal.execute_event) {
    return "EXECUTED";
  } else if (proposal.queue_event) {
    const queueEvent = proposal.queue_event;
    const queueTimestamp = Number(
      queueEvent?.timestamp ?? queueEvent?.blocktime ?? 0
    );
    // Check for no onchain actions (calldatas empty or all zeros)
    const hasNoOnchainActions =
      !proposal.calldatas ||
      proposal.calldatas.length === 0 ||
      proposal.calldatas.every((c) => c === "0x" || c === "");
    if (
      queueTimestamp > 0 &&
      Math.floor(Date.now() / 1000) - queueTimestamp > TEN_DAYS_IN_SECONDS &&
      hasNoOnchainActions
    ) {
      return "PASSED";
    }
    return "QUEUED";
  }

  // eas-oodao specific: check delete_event
  if (proposal.delete_event) {
    return "CANCELLED";
  }

  // Check if proposal is still active or pending
  const now = Math.floor(Date.now() / 1000);
  const startTime = Number(proposal.start_blocktime) || 0;
  const endTime = Number(proposal.end_blocktime) || 0;

  if (startTime > now) {
    return "PENDING";
  }
  if (endTime > now) {
    return "ACTIVE";
  }

  // For STANDARD proposals, use vote-based logic
  // Handle different data sources: EAS-OODAO vs standard
  const source = proposal.data_eng_properties?.source;
  const isApprovalVoting = proposal.voting_module === "approval";

  // For approval voting, use no-param for total votes, otherwise use token-holders
  const voteTotals =
    source === "eas-oodao"
      ? isApprovalVoting
        ? (proposal.outcome as EasOodaoVoteOutcome)?.["no-param"] || {}
        : (proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotes = convertToNumber(extractVoteValue(voteTotals["1"]), decimals);
  const againstVotes = convertToNumber(
    extractVoteValue(voteTotals["0"]),
    decimals
  );
  const abstainVotes = convertToNumber(
    extractVoteValue(voteTotals["2"]),
    decimals
  );
  const quorum = convertToNumber(String(quorumVotes), decimals);

  let quorumMet = true;
  let hasMetThreshold = true;

  if (proposal.voting_module === "optimistic") {
    const qorumVotes = againstVotes;
    quorumMet = qorumVotes < quorum;

    if (quorumMet) {
      return "SUCCEEDED";
    }
    return "DEFEATED";
  } else if (proposal.voting_module === "approval") {
    // Handle approval voting module
    const criteria = proposal.kwargs?.criteria;
    const thresholdRaw = proposal.kwargs?.criteria_value ?? 0;

    const isThresholdCriteria =
      criteria === "THRESHOLD" ||
      criteria === "threshold" ||
      criteria === 0 ||
      criteria === "0";

    if (quorum > forVotes) {
      return "DEFEATED";
    }

    if (isThresholdCriteria) {
      const threshold = safeBigInt(
        typeof thresholdRaw === "string" || typeof thresholdRaw === "number"
          ? thresholdRaw
          : 0
      );

      const totals =
        (proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] || {};

      let succeeded = false;
      for (const [optionKey, supportDict] of Object.entries(totals)) {
        if (optionKey === "no-param") continue;

        let optionVotes = 0n;
        for (const rawVotes of Object.values(supportDict ?? {})) {
          optionVotes += safeBigInt(rawVotes);
        }

        if (optionVotes > threshold) {
          succeeded = true;
          break;
        }
      }

      return succeeded ? "SUCCEEDED" : "DEFEATED";
    }

    return "SUCCEEDED";
  } else if (proposal.total_voting_power_at_start) {
    const totalPower = convertToNumber(
      proposal.total_voting_power_at_start,
      decimals
    );

    quorumMet = forVotes > quorum;
    hasMetThreshold =
      forVotes / (forVotes + againstVotes) >= approvalThreshold / 100;
  }

  if (quorumMet) {
    return "SUCCEEDED";
  }

  return "DEFEATED";
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
        quorum: 0,
        approvalThreshold: 0,
      };
    }

    return {
      quorum: type.quorum,
      approvalThreshold: type.approval_threshold ?? 0,
    };
  };

  const quotaValues =
    source === "eas-oodao"
      ? resolveFromEas()
      : {
          quorum: Number(proposal.quorum) ?? 0,
          approvalThreshold: Number(proposal.approval_threshold) ?? 0,
        };

  const votableSupply = safeBigInt(proposal.total_voting_power_at_start ?? 0);

  let quorumValue = 0n;

  if (source === "eas-oodao" && quotaValues.quorum > 0 && votableSupply > 0n) {
    quorumValue = (votableSupply * BigInt(quotaValues.quorum)) / 10000n;
  } else if (quotaValues.quorum > 0) {
    quorumValue = BigInt(quotaValues.quorum);
  }

  return {
    quorumVotes: quorumValue,
    approvalThreshold: quotaValues.approvalThreshold,
    votableSupply,
  };
};
