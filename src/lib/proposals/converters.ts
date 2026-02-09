import { formatUnits } from "ethers";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { isDaoNodeSource, isEasOodaoSource } from "./extractors/guards";

/**
 * Type conversion utilities for proposal data
 */

/**
 * Convert token amounts (with decimals) to regular numbers
 * Used for vote calculations and percentages
 */
export const convertToNumber = (
  amount: string | null | undefined,
  decimals: number
): number => {
  if (!amount) return 0;
  try {
    return Number(formatUnits(amount, decimals));
  } catch {
    return 0;
  }
};

/**
 * Extract a vote value from a vote totals entry.
 * Handles both flat string values (standard voting) and nested objects (approval voting).
 * For nested objects, returns the "1" (for) support type value.
 */
export const extractVoteValue = (
  value: string | { [supportType: string]: string } | undefined
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) return value["1"];
  return undefined;
};

/**
 * Convert values to BigInt for blockchain data
 * Returns 0n for invalid/null values
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
 * Convert values to BigInt, returning null for invalid values
 */
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

/**
 * Convert unix timestamp to Date object
 * Returns null for invalid/zero values
 */
export const toDate = (
  value: number | string | undefined | null
): Date | null => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return new Date(numeric * 1000);
};

/**
 * Extract time-related status information from a proposal
 */
export const deriveTimeStatus = (
  proposal: ArchiveListProposal,
  normalizedStatus: string
) => {
  const proposalStartTime = toDate(proposal.start_blocktime);
  const proposalEndTime = toDate(proposal.end_blocktime);

  // Get cancelled time based on source
  let proposalCancelledTime: Date | null = null;
  if (isEasOodaoSource(proposal) && proposal.delete_event) {
    proposalCancelledTime = toDate(proposal.delete_event.attestation_time);
  }

  // Get executed time (dao_node only)
  let proposalExecutedTime: Date | null = null;
  if (isDaoNodeSource(proposal) && proposal.execute_event) {
    proposalExecutedTime = toDate(
      proposal.execute_event.timestamp ?? proposal.execute_event.blocktime
    );
  }

  return {
    proposalStatus: normalizedStatus,
    proposalStartTime,
    proposalEndTime,
    proposalCancelledTime,
    proposalExecutedTime,
  } as const;
};
