import {
  ArchiveListProposal,
  deriveProposalType,
  EasOodaoVoteOutcome,
} from "@/lib/types/archiveProposal";
import {
  HYBRID_OPTIMISTIC_TIERED_THRESHOLD,
  OFFCHAIN_OPTIMISTIC_THRESHOLD,
  OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD,
  OFFCHAIN_THRESHOLDS,
} from "@/lib/constants";
import { convertToNumber } from "../converters";

/**
 * Derive status for OPTIMISTIC proposal types
 * Optimistic proposals pass unless vetoed by sufficient votes
 */
export const deriveOptimisticStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  // For simple OPTIMISTIC: veto if against > 50% of votable supply
  if (proposalType === "OPTIMISTIC") {
    const votableSupply = convertToNumber(
      String(proposal.votableSupply ?? proposal.votable_supply ?? "0"),
      decimals
    );
    const voteTotals = proposal.totals?.["no-param"] || {};
    const againstVotes = convertToNumber(
      String(voteTotals["0"] ?? "0"),
      decimals
    );

    if (votableSupply > 0 && againstVotes > votableSupply / 2) {
      return "DEFEATED";
    }
    return "SUCCEEDED";
  }

  // For TIERED variants: check tiered veto thresholds
  // HYBRID_OPTIMISTIC_TIERED, OFFCHAIN_OPTIMISTIC_TIERED, OFFCHAIN_OPTIMISTIC
  const tiers = proposal.tiers || getDefaultTiers(proposalType);
  const vetoResult = calculateTieredVeto(proposal, tiers, decimals);

  return vetoResult.vetoTriggered ? "DEFEATED" : "SUCCEEDED";
};

/**
 * Get default veto tiers based on proposal type
 */
export const getDefaultTiers = (proposalType: string): number[] => {
  if (proposalType === "HYBRID_OPTIMISTIC_TIERED") {
    return HYBRID_OPTIMISTIC_TIERED_THRESHOLD;
  }
  if (proposalType === "OFFCHAIN_OPTIMISTIC_TIERED") {
    return OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD;
  }
  if (proposalType === "OFFCHAIN_OPTIMISTIC") {
    return OFFCHAIN_OPTIMISTIC_THRESHOLD;
  }
  return [50, 50, 50]; // Default fallback
};

export interface TieredVetoResult {
  vetoTriggered: boolean;
}

/**
 * Calculate tiered veto for optimistic proposals
 * Returns whether veto is triggered based on group thresholds
 */
export const calculateTieredVeto = (
  proposal: ArchiveListProposal,
  tiers: number[],
  decimals: number
): TieredVetoResult => {
  // Get offchain vote data from govless_proposal or outcome
  const offchainData =
    proposal.govless_proposal?.outcome ||
    (proposal.outcome as EasOodaoVoteOutcome);

  if (!offchainData) {
    // No offchain data - can't calculate veto, default to not vetoed
    return { vetoTriggered: false };
  }

  // Calculate veto percentages for each group
  const getVetoPercentage = (groupKey: string, eligible: number): number => {
    const groupData = offchainData[groupKey as keyof typeof offchainData];
    if (!groupData || typeof groupData !== "object") return 0;
    const against = Number((groupData as Record<string, unknown>)["0"] ?? 0);
    return eligible > 0 ? (against / eligible) * 100 : 0;
  };

  const appVeto = getVetoPercentage("apps", OFFCHAIN_THRESHOLDS.APP);
  const userVeto = getVetoPercentage("users", OFFCHAIN_THRESHOLDS.USER);
  const chainVeto = getVetoPercentage("chains", OFFCHAIN_THRESHOLDS.CHAIN);

  // For OFFCHAIN_OPTIMISTIC_TIERED: average veto across 3 groups
  const proposalType = deriveProposalType(proposal);
  if (proposalType === "OFFCHAIN_OPTIMISTIC_TIERED") {
    const avgVeto = (appVeto + userVeto + chainVeto) / 3;
    return { vetoTriggered: avgVeto >= tiers[0] };
  }

  // For HYBRID: also include delegates
  let delegateVeto = 0;
  if (proposal.hybrid && proposal.total_voting_power_at_start) {
    const delegateEligible = convertToNumber(
      String(proposal.total_voting_power_at_start),
      decimals
    );
    const voteTotals = proposal.totals?.["no-param"] || {};
    const delegateAgainst = convertToNumber(
      String(voteTotals["0"] ?? "0"),
      decimals
    );
    delegateVeto =
      delegateEligible > 0 ? (delegateAgainst / delegateEligible) * 100 : 0;
  }

  // Progressive tier check: 4 groups at tier[2], 3 groups at tier[1], 2 groups at tier[0]
  const vetoPercentages = [delegateVeto, appVeto, userVeto, chainVeto];
  const countExceeding = (threshold: number) =>
    vetoPercentages.filter((v) => v >= threshold).length;

  const vetoTriggered =
    countExceeding(tiers[2]) >= 4 ||
    countExceeding(tiers[1]) >= 3 ||
    countExceeding(tiers[0]) >= 2;

  return { vetoTriggered };
};
