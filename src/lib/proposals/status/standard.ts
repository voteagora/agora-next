import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { convertToNumber } from "../converters";
import { extractThresholds } from "../thresholds";
import {
  isDaoNodeSource,
  isEasAtlasSource,
  isEasOodaoSource,
} from "../extractors/guards";

/**
 * Derive status for STANDARD proposal types
 */
export const deriveStandardStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  // Get vote totals based on source
  let voteTotals: Record<string, string | undefined> = {};
  let totalVotingPower: string | undefined;
  let calculationOptions = 0;

  if (isEasOodaoSource(proposal)) {
    const outcome = proposal.outcome as
      | { "token-holders"?: Record<string, string> }
      | undefined;
    voteTotals = outcome?.["token-holders"] || {};
    totalVotingPower = proposal.total_voting_power_at_start;
  } else if (isDaoNodeSource(proposal)) {
    voteTotals = proposal.totals?.["no-param"] || {};
    totalVotingPower = proposal.total_voting_power_at_start;
  } else if (isEasAtlasSource(proposal)) {
    // eas-atlas uses different vote structure
    calculationOptions = proposal.calculationOptions ?? 0;
  }

  const forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
  const againstVotes = convertToNumber(
    String(voteTotals["0"] ?? "0"),
    decimals
  );
  const abstainVotes = convertToNumber(
    String(voteTotals["2"] ?? "0"),
    decimals
  );

  const thresholds = extractThresholds(proposal);

  // Calculate vote threshold percentage (for / (for + against))
  const thresholdVotes = forVotes + againstVotes;
  const voteThresholdPercent =
    thresholdVotes > 0 ? (forVotes / thresholdVotes) * 100 : 0;

  // Check approval threshold
  const hasMetThreshold =
    voteThresholdPercent >= thresholds.approvalThreshold ||
    thresholds.approvalThreshold === 0;

  // Calculate quorum based on calculationOptions
  // calculationOptions=1 means for only, otherwise for+abstain
  const quorumVotes =
    calculationOptions === 1 ? forVotes : forVotes + abstainVotes;

  // Check quorum
  let quorumMet = true;
  if (totalVotingPower) {
    const totalPower = convertToNumber(String(totalVotingPower), decimals);
    const quorumPercentage =
      totalPower > 0 ? (quorumVotes / totalPower) * 100 : 0;
    quorumMet = quorumPercentage >= thresholds.quorum;
  }

  // For HYBRID_STANDARD: would need weighted calculation across groups
  // Without full breakdown, fall back to simple calculation
  if (
    proposalType === "HYBRID_STANDARD" ||
    proposalType === "OFFCHAIN_STANDARD"
  ) {
    // These require weighted voting across groups
    // The actual calculation is complex - for now use simple logic
    if (!quorumMet || forVotes < againstVotes || !hasMetThreshold) {
      return "DEFEATED";
    }
    return forVotes > againstVotes ? "SUCCEEDED" : "FAILED";
  }

  // Standard proposal logic
  if (!quorumMet || forVotes < againstVotes || !hasMetThreshold) {
    return "DEFEATED";
  }

  if (forVotes > againstVotes) {
    return "SUCCEEDED";
  }

  return "FAILED";
};
