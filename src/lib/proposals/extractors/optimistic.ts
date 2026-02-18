/**
 * Optimistic vote extraction functions
 *
 * Handles extraction of veto-based votes from all sources:
 * - dao_node: totals["no-param"]["0"] (against votes)
 * - eas-atlas: weighted citizen voting
 * - Hybrid: weighted combination of onchain + offchain
 */

import {
  CITIZEN_TYPES,
  HYBRID_VOTE_WEIGHTS,
  OFFCHAIN_THRESHOLDS,
} from "@/lib/constants";
import type {
  ArchiveListProposal,
  DaoNodeVoteTotals,
  EasAtlasVoteOutcome,
  EasOodaoVoteOutcome,
} from "@/lib/types/archiveProposal";
import type {
  ArchiveProposalInput,
  ExtractorOptions,
  OptimisticMetrics,
  OptimisticTieredMetrics,
} from "./types";
import {
  isDaoNodeSource,
  isEasAtlasSource,
  isHybridProposal,
  getVotingData,
  hasDaoNodeTotals,
} from "./guards";
import { convertToNumber } from "./standard";
import { deriveStatus } from "@/components/Proposals/Proposal/ArchiveProposalList/utils";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Aggregate votes across citizen types for a specific choice
 */
function aggregateVotes(
  outcome: Record<string, Record<string, number>>,
  key: string
): number {
  let total = 0;
  for (const type of CITIZEN_TYPES) {
    total += Number(outcome?.[type]?.[key] ?? 0);
  }
  return total;
}

/**
 * Calculate weighted offchain percentage (average across citizen types)
 */
function calcOffchainPercentage(
  userAgainst: number,
  appAgainst: number,
  chainAgainst: number
): number {
  return (
    ((userAgainst / OFFCHAIN_THRESHOLDS.USER) * 100 +
      (appAgainst / OFFCHAIN_THRESHOLDS.APP) * 100 +
      (chainAgainst / OFFCHAIN_THRESHOLDS.CHAIN) * 100) /
    3
  );
}

/**
 * Calculate weighted hybrid percentage (onchain delegates + offchain citizens)
 */
function calcHybridPercentage(
  onchainAgainst: bigint,
  eligibleDelegates: bigint,
  userAgainst: number,
  appAgainst: number,
  chainAgainst: number
): number {
  let weightedPct = 0;

  // Delegate percentage: precision loss from Number conversion is acceptable
  // since both values scale similarly and result is rounded to 1 decimal place
  if (eligibleDelegates > 0n) {
    weightedPct +=
      (Number(onchainAgainst) / Number(eligibleDelegates)) *
      HYBRID_VOTE_WEIGHTS.delegates *
      100;
  }

  weightedPct += (appAgainst / OFFCHAIN_THRESHOLDS.APP) * 100;
  weightedPct += (userAgainst / OFFCHAIN_THRESHOLDS.USER) * 100;
  weightedPct += (chainAgainst / OFFCHAIN_THRESHOLDS.CHAIN) * 100;
  return weightedPct / 4;
}

/**
 * Extract defeat threshold from decoded_proposal_data
 */
function extractDefeatThreshold(proposal: ArchiveListProposal): number {
  if (proposal.data_eng_properties?.source === "eas-oodao") {
    // Type guard to ensure proposal_type is FixedProposalType
    if (
      typeof proposal.proposal_type === "object" &&
      proposal.proposal_type !== null &&
      "approval_threshold" in proposal.proposal_type
    ) {
      return Number(proposal.proposal_type.approval_threshold) / 100;
    }
    return Number(proposal.approval_threshold) / 100;
  }
  const votingData = getVotingData(proposal);
  const decodedData =
    "decoded_proposal_data" in votingData
      ? (votingData.decoded_proposal_data as unknown[][])
      : undefined;

  // Default threshold is 20% (2000 basis points)
  const defaultThreshold = 2000;
  const rawThreshold = Number(decodedData?.[0]?.[0] || defaultThreshold);

  // Convert from basis points to percentage
  return rawThreshold / 100;
}

// =============================================================================
// Main Extractors
// =============================================================================

/**
 * Extract optimistic voting metrics from any proposal source.
 *
 * Handles:
 * - dao_node (pure optimistic): only delegate votes matter
 * - eas-atlas (offchain): weighted citizen percentages
 * - Hybrid: weighted combination of onchain + offchain
 */
export function extractOptimisticMetrics(
  proposal: ArchiveListProposal,
  options: ExtractorOptions
): OptimisticMetrics {
  const { tokenDecimals } = options;
  const votingData = getVotingData(proposal);
  const source = proposal.data_eng_properties?.source;
  const isHybrid = isHybridProposal(proposal);
  const status = deriveStatus(proposal, tokenDecimals);

  const defeatThreshold = extractDefeatThreshold(proposal);

  // Check if this is offchain or hybrid
  const isHybridOrOffchain = isHybrid || source === "eas-atlas";

  if (isHybridOrOffchain) {
    // HYBRID/OFFCHAIN OPTIMISTIC: Uses weighted citizen percentages
    const outcome = (
      "outcome" in votingData ? votingData.outcome : {}
    ) as EasAtlasVoteOutcome;

    const againstCount = aggregateVotes(
      outcome as Record<string, Record<string, number>>,
      "0"
    );

    // Calculate offchain citizen percentages with weights
    const userAgainst = Number(outcome?.USER?.["0"] ?? 0);
    const appAgainst = Number(outcome?.APP?.["0"] ?? 0);
    const chainAgainst = Number(outcome?.CHAIN?.["0"] ?? 0);

    let weightedAgainstPercentage: number;

    if (
      isHybrid &&
      "total_voting_power_at_start" in proposal &&
      proposal.total_voting_power_at_start
    ) {
      // For hybrid proposals, also account for onchain delegates
      const onchainAgainst = hasDaoNodeTotals(proposal)
        ? BigInt((proposal.totals as DaoNodeVoteTotals)["no-param"]?.["0"] ?? 0)
        : BigInt(0);
      const eligibleDelegates = BigInt(proposal.total_voting_power_at_start);

      weightedAgainstPercentage = calcHybridPercentage(
        onchainAgainst,
        eligibleDelegates,
        userAgainst,
        appAgainst,
        chainAgainst
      );
    } else {
      // For offchain-only, sum percentages and divide by 3
      weightedAgainstPercentage = calcOffchainPercentage(
        userAgainst,
        appAgainst,
        chainAgainst
      );
    }

    return {
      againstCount,
      againstPercentage: Math.round(weightedAgainstPercentage * 100) / 100,
      defeatThreshold,
      isDefeated: status === "DEFEATED",
    };
  } else {
    // Pure OPTIMISTIC: Only delegate votes matter
    const voteTotals = hasDaoNodeTotals(proposal)
      ? (proposal.totals as DaoNodeVoteTotals)["no-param"]
      : (proposal.outcome as EasOodaoVoteOutcome)["token-holders"];

    const againstVal = voteTotals["0"];
    const againstVotesRaw =
      typeof againstVal === "string" ? againstVal : String(againstVal ?? "0");
    const againstCount = convertToNumber(againstVotesRaw, tokenDecimals);

    // Calculate percentage based on total voting power
    let againstPercentage = 0;
    if (
      "total_voting_power_at_start" in proposal &&
      proposal.total_voting_power_at_start
    ) {
      const totalPower = convertToNumber(
        String(proposal.total_voting_power_at_start),
        tokenDecimals
      );
      againstPercentage =
        totalPower > 0
          ? Math.round((againstCount / totalPower) * 100 * 100) / 100
          : 0;
    }

    return {
      againstCount,
      againstPercentage,
      defeatThreshold,
      isDefeated: status === "DEFEATED",
    };
  }
}

/**
 * Extract optimistic tiered voting metrics.
 *
 * Similar to optimistic but with tier-based thresholds and support votes.
 */
export function extractOptimisticTieredMetrics(
  proposal: ArchiveListProposal,
  options: ExtractorOptions
): OptimisticTieredMetrics {
  const { tokenDecimals } = options;
  const votingData = getVotingData(proposal);
  const isHybrid = isHybridProposal(proposal);
  const status = deriveStatus(proposal, tokenDecimals);

  const outcome = (
    "outcome" in votingData ? votingData.outcome : {}
  ) as EasAtlasVoteOutcome;

  const againstCount = aggregateVotes(
    outcome as Record<string, Record<string, number>>,
    "0"
  );
  const supportCount = aggregateVotes(
    outcome as Record<string, Record<string, number>>,
    "2"
  );

  // Get tiers from proposal
  const tiers =
    "tiers" in votingData && Array.isArray(votingData.tiers)
      ? votingData.tiers
      : [];

  // Calculate offchain citizen percentages
  const userAgainst = Number(outcome?.USER?.["0"] ?? 0);
  const appAgainst = Number(outcome?.APP?.["0"] ?? 0);
  const chainAgainst = Number(outcome?.CHAIN?.["0"] ?? 0);

  let weightedAgainstPercentage: number;

  if (isHybrid && proposal.total_voting_power_at_start) {
    // For hybrid proposals, also account for onchain delegates
    const onchainAgainst = hasDaoNodeTotals(proposal)
      ? BigInt((proposal.totals as DaoNodeVoteTotals)["no-param"]?.["0"] ?? 0)
      : BigInt(0);
    const eligibleDelegates = BigInt(proposal.total_voting_power_at_start);
    weightedAgainstPercentage = calcHybridPercentage(
      onchainAgainst,
      eligibleDelegates,
      userAgainst,
      appAgainst,
      chainAgainst
    );
  } else {
    // For offchain-only, sum percentages and divide by 3
    weightedAgainstPercentage = calcOffchainPercentage(
      userAgainst,
      appAgainst,
      chainAgainst
    );
  }
  const sortedTiers = tiers.sort((a, b) => b - a);
  // Current tier is the last one
  const currentTier = sortedTiers.length > 0 ? sortedTiers[0] : 1700;

  return {
    againstCount,
    supportCount,
    againstPercentage: Math.round(weightedAgainstPercentage * 100) / 100,
    tiers: sortedTiers,
    currentTier,
    isDefeated: status === "DEFEATED",
  };
}
