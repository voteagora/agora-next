import {
  ArchiveListProposal,
  EasOodaoVoteOutcome,
} from "@/lib/types/archiveProposal";
import { convertToNumber } from "../converters";
import { extractThresholds } from "../thresholds";

/**
 * Derive status for APPROVAL proposal types
 */
export const deriveApprovalStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  // Check lifecycle_stage first
  if (proposal.lifecycle_stage === "DEFEATED") {
    return "DEFEATED";
  }
  if (proposal.lifecycle_stage === "SUCCEEDED") {
    return "SUCCEEDED";
  }

  const thresholds = extractThresholds(proposal);

  // For HYBRID_APPROVAL and OFFCHAIN_APPROVAL: check weighted participation quorum
  if (
    proposalType === "HYBRID_APPROVAL" ||
    proposalType === "OFFCHAIN_APPROVAL"
  ) {
    // These require 30% weighted participation quorum
    // Without full vote data breakdown, rely on lifecycle_stage or default to succeeded
    // The actual calculation requires per-group vote counts which may not be available
    return "SUCCEEDED";
  }

  // For standard APPROVAL: check quorum and criteria
  const source = proposal.data_eng_properties?.source;
  const voteTotals =
    source === "eas-oodao"
      ? (proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
  const abstainVotes = convertToNumber(
    String(voteTotals["2"] ?? "0"),
    decimals
  );

  // Quorum for approval = for + abstain
  const quorumVotes = forVotes + abstainVotes;

  // Check quorum
  if (proposal.total_voting_power_at_start) {
    const totalPower = convertToNumber(
      String(proposal.total_voting_power_at_start),
      decimals
    );
    const quorumPercentage =
      totalPower > 0 ? (quorumVotes / totalPower) * 100 : 0;
    if (quorumPercentage < thresholds.quorum) {
      return "DEFEATED";
    }
  }

  // Check criteria (THRESHOLD = 0, TOP_CHOICES = 1)
  const criteria = proposal.criteria ?? 0;
  const criteriaValue = proposal.criteria_value ?? 0;

  if (criteria === 0 && criteriaValue > 0) {
    // THRESHOLD: at least one option must exceed criteriaValue
    // Without per-option vote data, we can't verify this
    // Rely on lifecycle_stage or default to succeeded
  }

  // TOP_CHOICES: auto-succeeds if quorum met
  return "SUCCEEDED";
};
