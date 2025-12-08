import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { convertToNumber } from "../converters";
import { isDaoNodeSource, isEasOodaoSource } from "../extractors/guards";
import { extractApprovalMetrics } from "../extractors/approval";

// Criteria types for approval voting (raw values from decoded_proposal_data)
// See toApprovalVotingCriteria() in proposalUtils.ts
const CRITERIA_THRESHOLD = 0; // Options must meet a threshold
const CRITERIA_TOP_CHOICES = 1; // Top N options win

/**
 * Get quorum value for approval proposals
 * Uses proposal.quorum if available (including 0), otherwise total_voting_power_at_start / 3
 */
function getApprovalQuorum(
  proposal: ArchiveListProposal,
  decimals: number
): number {
  // First check if quorum is directly specified (including explicit 0)
  if (proposal.quorum && Number(proposal.quorum) > 0) {
    return convertToNumber(String(proposal.quorum), decimals);
  }
  if (proposal.quorumVotes && Number(proposal.quorumVotes) > 0) {
    return convertToNumber(String(proposal.quorumVotes), decimals);
  }

  // Otherwise use total_voting_power_at_start * 0.3
  const totalVotingPower = convertToNumber(
    String(proposal.total_voting_power_at_start ?? "0"),
    decimals
  );
  return totalVotingPower * 0.3;
}

/**
 * Derive status for APPROVAL proposal types
 *
 * Uses extractApprovalMetrics to get voting data and criteria configuration.
 */
export const deriveApprovalStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  // Get quorum: use proposal.quorum or total_voting_power_at_start / 3
  const quorumValue = getApprovalQuorum(proposal, decimals);

  // Use the existing extractor to get all approval metrics
  const approvalMetrics = extractApprovalMetrics(proposal, {
    tokenDecimals: decimals,
  });

  const { choices, criteria, criteriaValue } = approvalMetrics;
  // For OFFCHAIN_APPROVAL: matches old proposalStatus.ts - just quorum check, no criteria
  // Note: HYBRID_APPROVAL requires calculateHybridApprovalProposalMetrics() which needs parsed data
  if (proposalType === "OFFCHAIN_APPROVAL") {
    // Old code: just checks for + abstain against quorum
    const totalApprovals = choices.reduce((sum, c) => sum + c.approvals, 0);

    if (totalApprovals < quorumValue) {
      return "DEFEATED";
    }
    return "SUCCEEDED";
  }

  // HYBRID_APPROVAL should use calculateHybridApprovalProposalMetrics in calling code
  // This function doesn't have access to the parsed proposalData needed for weighted calculation
  if (proposalType === "HYBRID_APPROVAL") {
    // Fallback: simple quorum + criteria check (may not match old behavior exactly)
    const totalApprovals = choices.reduce((sum, c) => sum + c.approvals, 0);

    if (totalApprovals < quorumValue) {
      return "DEFEATED";
    }

    if (criteria === CRITERIA_THRESHOLD) {
      const thresholdVotes = convertToNumber(String(criteriaValue), decimals);
      for (const choice of choices) {
        if (choice.approvals > thresholdVotes) {
          return "SUCCEEDED";
        }
      }
      return "DEFEATED";
    }
    return "SUCCEEDED";
  }

  // For standard APPROVAL (onchain only): check quorum and criteria
  let voteTotals: Record<string, string | undefined> = {};
  let totalVotingPower: string | undefined;

  if (isEasOodaoSource(proposal)) {
    const outcome = proposal.outcome as
      | { "token-holders"?: Record<string, string> }
      | undefined;
    voteTotals = outcome?.["token-holders"] || {};
    totalVotingPower = proposal.total_voting_power_at_start;
  } else if (isDaoNodeSource(proposal)) {
    voteTotals = proposal.totals?.["no-param"] || {};
    totalVotingPower = proposal.total_voting_power_at_start;
  }

  const forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
  const abstainVotes = convertToNumber(
    String(voteTotals["2"] ?? "0"),
    decimals
  );

  // Quorum for approval = for + abstain
  const quorumVotes = forVotes + abstainVotes;

  // Check quorum - use quorumValue calculated from proposal.quorum or VP/3
  if (quorumVotes < quorumValue) {
    return "DEFEATED";
  }

  // Check criteria - matches old proposalStatus.ts logic
  if (criteria === CRITERIA_THRESHOLD) {
    // THRESHOLD: at least one option must have votes > criteriaValue
    const thresholdVotes = convertToNumber(String(criteriaValue), decimals);

    for (const choice of choices) {
      if (choice.approvals > thresholdVotes) {
        return "SUCCEEDED";
      }
    }
    return "DEFEATED";
  } else {
    // TOP_CHOICES: auto-succeeds if quorum met (old behavior)
    return "SUCCEEDED";
  }
};
