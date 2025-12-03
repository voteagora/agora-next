import {
  ArchiveListProposal,
  EasAtlasVoteOutcome,
} from "@/lib/types/archiveProposal";
import { OFFCHAIN_THRESHOLDS, HYBRID_VOTE_WEIGHTS } from "@/lib/constants";
import { convertToNumber } from "../converters";
import { extractThresholds } from "../thresholds";
import {
  isDaoNodeSource,
  isEasOodaoSource,
  isHybridProposal,
  isEasAtlasSource,
} from "../extractors/guards";

/**
 * Calculate weighted participation for hybrid/offchain approval proposals
 * Returns participation percentage (0-100)
 */
function calculateWeightedParticipation(
  proposal: ArchiveListProposal,
  decimals: number
): number {
  // Get offchain outcome
  let offchainOutcome: EasAtlasVoteOutcome | undefined;

  if (isHybridProposal(proposal)) {
    offchainOutcome = proposal.govless_proposal?.outcome as EasAtlasVoteOutcome;
  } else if (isEasAtlasSource(proposal)) {
    offchainOutcome = proposal.outcome as EasAtlasVoteOutcome;
  }

  if (!offchainOutcome) {
    return 0;
  }

  // Calculate participation for each citizen group
  const getGroupParticipation = (
    groupKey: "USER" | "APP" | "CHAIN",
    eligible: number
  ): number => {
    const groupData = offchainOutcome?.[groupKey];
    if (!groupData || eligible === 0) return 0;
    const totalVotes =
      Number(groupData["0"] ?? 0) +
      Number(groupData["1"] ?? 0) +
      Number(groupData["2"] ?? 0);
    return (totalVotes / eligible) * 100;
  };

  const userParticipation = getGroupParticipation(
    "USER",
    OFFCHAIN_THRESHOLDS.USER
  );
  const appParticipation = getGroupParticipation(
    "APP",
    OFFCHAIN_THRESHOLDS.APP
  );
  const chainParticipation = getGroupParticipation(
    "CHAIN",
    OFFCHAIN_THRESHOLDS.CHAIN
  );

  // For hybrid, also include delegate participation
  if (isHybridProposal(proposal) && isDaoNodeSource(proposal)) {
    const totalVotingPower = convertToNumber(
      String(proposal.total_voting_power_at_start ?? "0"),
      decimals
    );
    const voteTotals = proposal.totals?.["no-param"] || {};
    const delegateVotes =
      convertToNumber(String(voteTotals["0"] ?? "0"), decimals) +
      convertToNumber(String(voteTotals["1"] ?? "0"), decimals) +
      convertToNumber(String(voteTotals["2"] ?? "0"), decimals);
    const delegateParticipation =
      totalVotingPower > 0 ? (delegateVotes / totalVotingPower) * 100 : 0;

    // Weighted average across 4 groups
    return (
      delegateParticipation * HYBRID_VOTE_WEIGHTS.delegates +
      userParticipation * HYBRID_VOTE_WEIGHTS.users +
      appParticipation * HYBRID_VOTE_WEIGHTS.apps +
      chainParticipation * HYBRID_VOTE_WEIGHTS.chains
    );
  }

  // For offchain only, average across 3 groups
  return (userParticipation + appParticipation + chainParticipation) / 3;
}

/**
 * Derive status for APPROVAL proposal types
 */
export const deriveApprovalStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  const thresholds = extractThresholds(proposal);

  // For HYBRID_APPROVAL and OFFCHAIN_APPROVAL: check weighted participation quorum
  if (
    proposalType === "HYBRID_APPROVAL" ||
    proposalType === "OFFCHAIN_APPROVAL"
  ) {
    const weightedParticipation = calculateWeightedParticipation(
      proposal,
      decimals
    );

    // Check if participation meets quorum threshold (default 30%)
    const quorumThreshold = thresholds.quorum || 30;
    if (weightedParticipation < quorumThreshold) {
      return "DEFEATED";
    }

    // For approval voting, if quorum is met, it succeeds
    // (the actual winner determination is separate from pass/fail)
    return "SUCCEEDED";
  }

  // For standard APPROVAL: check quorum and criteria based on source
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

  // criteria fields are on ArchiveListProposal directly
  const criteria = proposal.criteria ?? 0;
  const criteriaValue = proposal.criteria_value ?? 0;

  const forVotes = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
  const abstainVotes = convertToNumber(
    String(voteTotals["2"] ?? "0"),
    decimals
  );

  // Quorum for approval = for + abstain
  const quorumVotes = forVotes + abstainVotes;

  // Check quorum
  if (totalVotingPower) {
    const totalPower = convertToNumber(String(totalVotingPower), decimals);
    const quorumPercentage =
      totalPower > 0 ? (quorumVotes / totalPower) * 100 : 0;
    if (quorumPercentage < thresholds.quorum) {
      return "DEFEATED";
    }
  }

  // Check criteria (THRESHOLD = 0, TOP_CHOICES = 1)
  if (criteria === 0 && criteriaValue > 0) {
    // THRESHOLD: at least one option must exceed criteriaValue
    // Without per-option vote data, we can't verify this
    // Rely on lifecycle_stage or default to succeeded
  }

  // TOP_CHOICES: auto-succeeds if quorum met
  return "SUCCEEDED";
};
