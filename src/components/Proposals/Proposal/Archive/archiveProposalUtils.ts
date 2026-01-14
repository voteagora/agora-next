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
  // Check terminal states first
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
  const voteTotals =
    source === "eas-oodao"
      ? (proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
  const againstVotes = convertToNumber(
    String(voteTotals["0"] ?? "0"),
    decimals
  );
  const abstainVotes = convertToNumber(
    String(voteTotals["2"] ?? "0"),
    decimals
  );

  // Extract thresholds from proposal (as percentages, e.g., 4 = 4%, 100 = 100%)
  const thresholds = extractThresholds(proposal);
  // Check quorum and approval threshold - we need total voting power
  let quorumMet = true;
  let hasMetThreshold = true;

  if (proposal.kwargs?.voting_module === "optimistic") {
    const qorumVotes = againstVotes;
    const totalPower = convertToNumber(
      proposal.total_voting_power_at_start,
      decimals
    );
    const failingQorum = thresholds.quorum * totalPower;
    quorumMet = qorumVotes < failingQorum;
    const approvalThreshold = thresholds.approvalThreshold * totalPower;
    hasMetThreshold = qorumVotes < approvalThreshold;
    if (quorumMet && hasMetThreshold) {
      return "SUCCEEDED";
    }
    return "DEFEATED";
  } else if (proposal.kwargs?.voting_module === "approval") {
    // Handle approval voting module
    const criteria = proposal.kwargs?.criteria;
    const thresholdRaw =
      proposal.kwargs?.threshold ?? proposal.kwargs?.criteria_value ?? 0;

    const isThresholdCriteria =
      criteria === "THRESHOLD" ||
      criteria === "threshold" ||
      criteria === 0 ||
      criteria === "0";

    if (isThresholdCriteria) {
      const threshold = safeBigInt(
        typeof thresholdRaw === "string" || typeof thresholdRaw === "number"
          ? thresholdRaw
          : 0
      );

      const totals = (proposal.totals ?? {}) as Record<
        string,
        Record<string, string>
      >;

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

    // Quorum check: (FOR + AGAINST + ABSTAIN) >= (quorum% × total_voting_power)
    const quorumVotes = forVotes + againstVotes + abstainVotes;
    const passingQuorum = (thresholds.quorum / 100) * totalPower;
    quorumMet = quorumVotes >= passingQuorum;

    // Approval threshold check: FOR >= (approval_threshold% × total_voting_power)
    const passingApprovalThreshold =
      (thresholds.approvalThreshold / 100) * totalPower;
    hasMetThreshold =
      forVotes >= passingApprovalThreshold ||
      thresholds.approvalThreshold === 0;
  }
  // If total_voting_power_at_start is not available, we can't check quorum
  // This happens for proposals that haven't started voting yet
  // Default to true to avoid incorrectly marking as defeated

  // Proposal is defeated if:
  // 1. Quorum not met, OR
  // 2. Approval threshold not met
  // Note: We don't check for > against here, the approval threshold handles that
  if (!quorumMet || !hasMetThreshold) {
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

  let quorumValue = 0n;

  if (
    source === "eas-oodao" &&
    quotaValues.quorum > 0n &&
    totalVotingPowerRaw > 0n
  ) {
    quorumValue = (totalVotingPowerRaw * quotaValues.quorum) / 10000n;
  } else if (quotaValues.quorum > 0n) {
    quorumValue = quotaValues.quorum;
  }

  const votableSupply = safeBigInt(proposal.total_voting_power_at_start ?? 0);

  return {
    quorum: quorumValue,
    approvalThreshold: quotaValues.approvalThreshold,
    votableSupply,
  };
};
