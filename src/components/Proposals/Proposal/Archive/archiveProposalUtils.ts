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

export const resolveArchiveThresholds = (proposal: ArchiveListProposal) => {
  const source = proposal.data_eng_properties?.source;

  const resolveFromEas = () => {
    const type = proposal.proposal_type as any;
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
