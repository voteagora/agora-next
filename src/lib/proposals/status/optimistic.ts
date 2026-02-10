import {
  ArchiveListProposal,
  deriveProposalType,
  EasOodaoVoteOutcome,
  EasAtlasVoteOutcome,
} from "@/lib/types/archiveProposal";
import {
  HYBRID_OPTIMISTIC_TIERED_THRESHOLD,
  OFFCHAIN_OPTIMISTIC_THRESHOLD,
  OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD,
  OFFCHAIN_THRESHOLDS,
} from "@/lib/constants";
import { convertToNumber } from "../converters";
import {
  isDaoNodeSource,
  isEasAtlasSource,
  isEasOodaoSource,
} from "../extractors/guards";

/**
 * Derive status for OPTIMISTIC proposal types
 * Optimistic proposals pass unless vetoed by sufficient votes
 */
export const deriveOptimisticStatus = (
  proposal: ArchiveListProposal,
  proposalType: string,
  decimals: number
): string => {
  // For simple OPTIMISTIC (dao_node): veto if against > threshold
  if (proposalType === "OPTIMISTIC" && isDaoNodeSource(proposal)) {
    const votableSupply = BigInt(
      proposal.votableSupply ?? proposal.total_voting_power_at_start ?? "0"
    );
    const voteTotals = proposal.totals?.["no-param"] || {};
    const againstVotes = BigInt(voteTotals["0"] ?? "0");

    // Extract threshold from decoded_proposal_data
    let threshold: bigint;
    if (
      proposal.decoded_proposal_data &&
      Array.isArray(proposal.decoded_proposal_data) &&
      proposal.decoded_proposal_data[0] &&
      Array.isArray(proposal.decoded_proposal_data[0])
    ) {
      const thresholdBps = Number(proposal.decoded_proposal_data[0][0]);
      const isRelative = Boolean(proposal.decoded_proposal_data[0][1]);

      if (isRelative) {
        // Threshold is relative: % of votable supply (basis points)
        threshold = (votableSupply * BigInt(thresholdBps)) / 10000n;
      } else {
        // Threshold is absolute value in basis points
        threshold = BigInt(thresholdBps);
      }
    } else {
      // Default: 50% of votable supply
      threshold = votableSupply / 2n;
    }

    // Proposal is defeated if veto votes exceed threshold
    if (againstVotes > threshold) {
      return "DEFEATED";
    }
    return "SUCCEEDED";
  }

  // For simple OPTIMISTIC (eas-oodao): veto if against > threshold % of votable supply
  if (proposalType === "OPTIMISTIC" && isEasOodaoSource(proposal)) {
    const votableSupply = BigInt(proposal.total_voting_power_at_start ?? "0");
    const tokenHolders =
      (proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] ?? {};
    const againstVotes = BigInt(
      (tokenHolders["0"] as string | undefined) ?? "0"
    );

    // Threshold from proposal_type.approval_threshold (basis points)
    const thresholdBps =
      typeof proposal.proposal_type === "object" && proposal.proposal_type
        ? Number(proposal.proposal_type.approval_threshold ?? 0)
        : 0;
    const threshold =
      thresholdBps > 0
        ? (votableSupply * BigInt(thresholdBps)) / 10000n
        : votableSupply / 2n;

    if (againstVotes > threshold) {
      return "DEFEATED";
    }
    return "SUCCEEDED";
  }

  // For TIERED variants: check tiered veto thresholds
  const tiers = getTiers(proposal, proposalType);
  const vetoResult = calculateTieredVeto(proposal, tiers, decimals);

  return vetoResult.vetoTriggered ? "DEFEATED" : "SUCCEEDED";
};

/**
 * Get tiers from proposal or use defaults
 */
function getTiers(
  proposal: ArchiveListProposal,
  proposalType: string
): number[] {
  // Check for tiers in eas-atlas proposals
  if (isEasAtlasSource(proposal) && proposal.tiers?.length) {
    return proposal.tiers;
  }
  // Check for tiers in dao_node hybrid proposals
  if (isDaoNodeSource(proposal) && proposal.govless_proposal?.tiers?.length) {
    return proposal.govless_proposal.tiers;
  }
  return getDefaultTiers(proposalType);
}

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
  // Get offchain vote data based on source
  let offchainData: EasAtlasVoteOutcome | EasOodaoVoteOutcome | undefined;

  if (isDaoNodeSource(proposal) && proposal.govless_proposal?.outcome) {
    offchainData = proposal.govless_proposal.outcome as EasAtlasVoteOutcome;
  } else if (isEasAtlasSource(proposal) && proposal.outcome) {
    offchainData = proposal.outcome as EasAtlasVoteOutcome;
  } else if (isEasOodaoSource(proposal) && proposal.outcome) {
    offchainData = proposal.outcome as EasOodaoVoteOutcome;
  }

  if (!offchainData) {
    // No offchain data - can't calculate veto, default to not vetoed
    return { vetoTriggered: false };
  }

  // Calculate veto percentages for each group
  const getVetoPercentage = (groupKey: string, eligible: number): number => {
    const groupData = offchainData![groupKey as keyof typeof offchainData];
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
  if (
    isDaoNodeSource(proposal) &&
    proposal.hybrid &&
    proposal.total_voting_power_at_start
  ) {
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
