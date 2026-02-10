import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { convertToNumber } from "../converters";
import { isDaoNodeSource, isEasOodaoSource } from "../extractors/guards";
import { extractApprovalMetrics } from "../extractors/approval";
import {
  HYBRID_VOTE_WEIGHTS,
  HYBRID_PROPOSAL_QUORUM,
  OFFCHAIN_THRESHOLDS,
} from "@/lib/constants";

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
  if (proposal.quorum && Number(proposal.quorum) > 0) {
    return convertToNumber(String(proposal.quorum), decimals);
  }
  if (proposal.quorumVotes && Number(proposal.quorumVotes) > 0) {
    return convertToNumber(String(proposal.quorumVotes), decimals);
  }

  const totalVotingPower = convertToNumber(
    String(proposal.total_voting_power_at_start ?? "0"),
    decimals
  );

  // For eas-oodao, use proposal_type.quorum (basis points) as percentage of VP
  if (
    isEasOodaoSource(proposal) &&
    typeof proposal.proposal_type === "object" &&
    proposal.proposal_type !== null &&
    "quorum" in proposal.proposal_type &&
    Number(proposal.proposal_type.quorum) > 0
  ) {
    return totalVotingPower * (Number(proposal.proposal_type.quorum) / 10000);
  }

  // Fallback: use total_voting_power_at_start * 0.3
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

  if (proposalType === "OFFCHAIN_APPROVAL") {
    // Use unique voter count (num_of_votes) for quorum check
    // totalApprovals would be inflated since one voter can vote for multiple options
    const totalVoters = approvalMetrics.totalVoters || 0;

    if (totalVoters < quorumValue) {
      return "DEFEATED";
    }

    // Criteria check
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
  } else if (proposalType === "HYBRID_APPROVAL") {
    // Weighted participation across delegates + citizen types (APP, USER, CHAIN)
    const weights = HYBRID_VOTE_WEIGHTS;
    const quorumThreshold = HYBRID_PROPOSAL_QUORUM * 100; // 30% quorum
    const quorumRaw = Number(proposal.quorum || 0);

    // Eligible voters per group
    // Delegates: quorum is 30% of votable supply, so total eligible = quorum * (100/30)
    const eligibleVoters = {
      delegates:
        quorumRaw > 0
          ? convertToNumber(String(quorumRaw), decimals) * (100 / 30)
          : 1,
      apps: OFFCHAIN_THRESHOLDS.APP,
      users: OFFCHAIN_THRESHOLDS.USER,
      chains: OFFCHAIN_THRESHOLDS.CHAIN,
    };

    // Delegate for/against from onchain totals
    const voteTotals = proposal.totals?.["no-param"] || {};
    const delegateFor = convertToNumber(
      String(voteTotals["1"] ?? "0"),
      decimals
    );
    const delegateAgainst = convertToNumber(
      String(voteTotals["0"] ?? "0"),
      decimals
    );
    const delegateTotal = delegateFor + delegateAgainst;

    // Citizen outcome from govless_proposal
    const outcome = (proposal.govless_proposal?.outcome ?? {}) as Record<
      string,
      Record<string, Record<string, number>>
    >;

    // Get max votes any single option received per citizen type (unique voter proxy)
    const getMaxVotesForType = (
      typeOutcome: Record<string, Record<string, number>> | undefined
    ): number => {
      if (!typeOutcome) return 0;
      return Math.max(
        0,
        ...Object.values(typeOutcome).map((v) => Number(v["1"] ?? 0))
      );
    };

    const citizenVoters = {
      apps: getMaxVotesForType(outcome.APP),
      users: getMaxVotesForType(outcome.USER),
      chains: getMaxVotesForType(outcome.CHAIN),
    };

    // Calculate weighted unique participation percentage
    let uniqueParticipation = 0;
    uniqueParticipation +=
      (delegateTotal / eligibleVoters.delegates) * 100 * weights.delegates;
    uniqueParticipation +=
      (citizenVoters.apps / eligibleVoters.apps) * 100 * weights.apps;
    uniqueParticipation +=
      (citizenVoters.users / eligibleVoters.users) * 100 * weights.users;
    uniqueParticipation +=
      (citizenVoters.chains / eligibleVoters.chains) * 100 * weights.chains;

    if (uniqueParticipation < quorumThreshold) {
      return "DEFEATED";
    }

    if (criteria === CRITERIA_THRESHOLD) {
      // Build per-option weighted percentages across all voter types
      // and check if any option meets the threshold
      const delegateTotals = proposal.totals as Record<
        string,
        Record<string, string>
      >;

      for (const choice of choices) {
        const delegateVotes = convertToNumber(
          String(delegateTotals?.[choice.index.toString()]?.["1"] ?? "0"),
          decimals
        );
        const appVotes = Number(
          outcome?.APP?.[choice.index.toString()]?.["1"] ?? 0
        );
        const userVotes = Number(
          outcome?.USER?.[choice.index.toString()]?.["1"] ?? 0
        );
        const chainVotes = Number(
          outcome?.CHAIN?.[choice.index.toString()]?.["1"] ?? 0
        );

        let weightedPct = 0;
        weightedPct +=
          (delegateVotes / eligibleVoters.delegates) * weights.delegates * 100;
        weightedPct += (appVotes / eligibleVoters.apps) * weights.apps * 100;
        weightedPct += (userVotes / eligibleVoters.users) * weights.users * 100;
        weightedPct +=
          (chainVotes / eligibleVoters.chains) * weights.chains * 100;

        // criteriaValue is in basis points (10000 = 100%)
        const thresholdPct = Number(criteriaValue) / 10000;
        if (weightedPct >= thresholdPct) {
          return "SUCCEEDED";
        }
      }
      return "DEFEATED";
    }
    return "SUCCEEDED";
  }
  // Fallback for standard APPROVAL (onchain/eas-oodao): check quorum and criteria
  // For eas-oodao, vote totals are in outcome["no-param"], not totals["no-param"]
  const voteTotals = isEasOodaoSource(proposal)
    ? (proposal.outcome as Record<string, Record<string, string>>)?.[
        "no-param"
      ] || {}
    : proposal.totals?.["no-param"] || {};
  const forVotes = BigInt(voteTotals["1"] ?? "0");
  const abstainVotes = BigInt(voteTotals["2"] ?? "0");

  // Quorum for approval = for + abstain
  const quorumVotes = forVotes + abstainVotes;

  // Check quorum - use quorumValue calculated from proposal.quorum or VP/3
  if (
    convertToNumber(String(quorumVotes), decimals) < quorumValue &&
    quorumValue > 0
  ) {
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
