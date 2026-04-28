/**
 * Standard vote extraction functions
 *
 * Handles extraction of for/against/abstain votes from all sources:
 * - dao_node: totals["no-param"]
 * - eas-atlas: outcome[USER/APP/CHAIN]
 * - eas-oodao: outcome["token-holders"]
 */

import {
  CITIZEN_TYPES,
  HYBRID_VOTE_WEIGHTS,
  OFFCHAIN_THRESHOLDS,
} from "@/lib/constants";
import type {
  DaoNodeVoteTotals,
  EasAtlasVoteOutcome,
  EasOodaoVoteOutcome,
  GovlessProposal,
} from "@/lib/types/archiveProposal";
import type {
  ArchiveProposalInput,
  ExtractorOptions,
  StandardMetrics,
  VoteData,
  VoteDataWithRaw,
} from "./types";
import {
  isDaoNodeSource,
  isEasAtlasSource,
  isEasOodaoSource,
  isHybridProposal,
  getVotingData,
  hasDaoNodeTotals,
  hasEasAtlasOutcome,
  hasEasOodaoOutcome,
} from "./guards";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert wei string to number with decimals
 */
export function convertToNumber(value: string, decimals: number): number {
  if (!value || value === "0") return 0;
  try {
    const num = BigInt(value);
    const divisor = BigInt(10 ** decimals);
    return Number(num / divisor) + Number(num % divisor) / Number(divisor);
  } catch {
    return parseFloat(value) || 0;
  }
}

/**
 * Ensure percentage is within valid range [0, 100]
 */
export function ensurePercentage(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

// =============================================================================
// Source-Specific Extractors
// =============================================================================

/**
 * Extract votes from dao_node totals format
 * Keys: "0" = against, "1" = for, "2" = abstain
 */
export function extractFromDaoNodeTotals(
  totals: Record<string, string | number> | undefined,
  decimals: number
): VoteDataWithRaw {
  const forRaw = String(totals?.["1"] ?? "0");
  const againstRaw = String(totals?.["0"] ?? "0");
  const abstainRaw = String(totals?.["2"] ?? "0");

  return {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: convertToNumber(forRaw, decimals),
    againstVotes: convertToNumber(againstRaw, decimals),
    abstainVotes: convertToNumber(abstainRaw, decimals),
  };
}

/**
 * Extract votes from eas-oodao token-holders format
 */
export function extractFromEasOodao(
  outcome: EasOodaoVoteOutcome | undefined
): VoteDataWithRaw {
  const th = outcome?.["token-holders"];
  const forRaw = String(th?.["1"] ?? "0");
  const againstRaw = String(th?.["0"] ?? "0");
  const abstainRaw = String(th?.["2"] ?? "0");

  return {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: Number(th?.["1"] ?? 0),
    againstVotes: Number(th?.["0"] ?? 0),
    abstainVotes: Number(th?.["2"] ?? 0),
  };
}

/**
 * Aggregate votes across citizen types (USER, APP, CHAIN) for eas-atlas
 */
export function aggregateOffchainVotes(
  outcome: EasAtlasVoteOutcome | undefined
): VoteDataWithRaw {
  let forVotes = 0;
  let againstVotes = 0;
  let abstainVotes = 0;

  for (const type of CITIZEN_TYPES) {
    const typeData = outcome?.[type as keyof EasAtlasVoteOutcome];
    if (typeData) {
      forVotes += Number(typeData["1"] ?? 0);
      againstVotes += Number(typeData["0"] ?? 0);
      abstainVotes += Number(typeData["2"] ?? 0);
    }
  }

  return {
    forVotes,
    againstVotes,
    abstainVotes,
    forRaw: String(forVotes),
    againstRaw: String(againstVotes),
    abstainRaw: String(abstainVotes),
  };
}

// =============================================================================
// Hybrid Vote Calculation
// =============================================================================

/**
 * Calculate weighted hybrid percentage for a single vote type
 */
export function calcWeightedPercentage(
  onchainVotes: number,
  eligibleDelegates: number,
  offchain: { user: number; app: number; chain: number }
): number {
  const delegatePct = (onchainVotes / eligibleDelegates) * 100;
  const userPct = (offchain.user / OFFCHAIN_THRESHOLDS.USER) * 100;
  const appPct = (offchain.app / OFFCHAIN_THRESHOLDS.APP) * 100;
  const chainPct = (offchain.chain / OFFCHAIN_THRESHOLDS.CHAIN) * 100;

  return (
    delegatePct * HYBRID_VOTE_WEIGHTS.delegates +
    userPct * HYBRID_VOTE_WEIGHTS.users +
    appPct * HYBRID_VOTE_WEIGHTS.apps +
    chainPct * HYBRID_VOTE_WEIGHTS.chains
  );
}

/**
 * Extract hybrid votes (weighted onchain + offchain)
 */
export function extractHybridVotes(
  proposal: ArchiveProposalInput,
  decimals: number
): VoteDataWithRaw {
  // Get onchain votes from dao_node totals
  const voteTotals = hasDaoNodeTotals(proposal)
    ? (proposal.totals as DaoNodeVoteTotals)["no-param"]
    : {};

  const {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: onFor,
    againstVotes: onAgainst,
    abstainVotes: onAbstain,
  } = extractFromDaoNodeTotals(voteTotals, decimals);

  // Get offchain votes from govless_proposal
  const govlessProposal = isHybridProposal(proposal)
    ? proposal.govless_proposal
    : undefined;
  const offchainOutcome = (govlessProposal?.outcome ??
    {}) as EasAtlasVoteOutcome;

  // Get eligible delegates for percentage calculation (converted to same units as votes)
  const eligibleDelegates =
    "total_voting_power_at_start" in proposal &&
    proposal.total_voting_power_at_start
      ? convertToNumber(String(proposal.total_voting_power_at_start), decimals)
      : 1;

  return {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: calcWeightedPercentage(onFor, eligibleDelegates, {
      user: Number(offchainOutcome?.USER?.["1"] ?? 0),
      app: Number(offchainOutcome?.APP?.["1"] ?? 0),
      chain: Number(offchainOutcome?.CHAIN?.["1"] ?? 0),
    }),
    againstVotes: calcWeightedPercentage(onAgainst, eligibleDelegates, {
      user: Number(offchainOutcome?.USER?.["0"] ?? 0),
      app: Number(offchainOutcome?.APP?.["0"] ?? 0),
      chain: Number(offchainOutcome?.CHAIN?.["0"] ?? 0),
    }),
    abstainVotes: calcWeightedPercentage(onAbstain, eligibleDelegates, {
      user: Number(offchainOutcome?.USER?.["2"] ?? 0),
      app: Number(offchainOutcome?.APP?.["2"] ?? 0),
      chain: Number(offchainOutcome?.CHAIN?.["2"] ?? 0),
    }),
  };
}

// =============================================================================
// Segment Calculation
// =============================================================================

/**
 * Compute percentage segments from vote counts
 */
export function computeSegments(
  votes: VoteData,
  useDirectPercentages: boolean = false
): StandardMetrics["segments"] {
  const { forVotes, againstVotes, abstainVotes } = votes;
  const total = forVotes + againstVotes + abstainVotes;

  if (useDirectPercentages) {
    // Hybrid: values are already weighted percentages
    return {
      forPercentage: ensurePercentage(forVotes),
      againstPercentage: ensurePercentage(againstVotes),
      abstainPercentage: ensurePercentage(abstainVotes),
    };
  }

  if (total === 0) {
    return { forPercentage: 0, againstPercentage: 0, abstainPercentage: 0 };
  }

  return {
    forPercentage: ensurePercentage((forVotes / total) * 100),
    againstPercentage: ensurePercentage((againstVotes / total) * 100),
    abstainPercentage: ensurePercentage((abstainVotes / total) * 100),
  };
}

// =============================================================================
// Main Extractor
// =============================================================================

/**
 * Extract standard voting metrics from any proposal source.
 *
 * Handles:
 * - dao_node (onchain)
 * - eas-atlas (offchain citizen voting)
 * - eas-oodao (offchain token-holders)
 * - Hybrid proposals (weighted combination)
 */
export function extractStandardMetrics(
  proposal: ArchiveProposalInput,
  options: ExtractorOptions
): StandardMetrics {
  const { tokenDecimals } = options;
  const source = proposal.data_eng_properties?.source;
  const isHybrid = isHybridProposal(proposal);

  let data: VoteDataWithRaw;

  if (isEasOodaoSource(proposal) || source === "eas-oodao") {
    // EAS OODAO: token-holders outcome
    const outcome = hasEasOodaoOutcome(proposal) ? proposal.outcome : undefined;
    data = extractFromEasOodao(outcome);
  } else if (isHybrid) {
    // Hybrid: weighted onchain + offchain
    data = extractHybridVotes(proposal, tokenDecimals);
  } else if (isEasAtlasSource(proposal) || source === "eas-atlas") {
    // Offchain only: aggregate citizen votes
    const votingData = getVotingData(proposal);
    const outcome = hasEasAtlasOutcome(votingData)
      ? votingData.outcome
      : undefined;
    data = aggregateOffchainVotes(outcome);
  } else {
    // Onchain only (dao_node)
    const voteTotals = hasDaoNodeTotals(proposal)
      ? (proposal.totals as DaoNodeVoteTotals)["no-param"]
      : {};
    data = extractFromDaoNodeTotals(voteTotals, tokenDecimals);
  }

  const total = data.forVotes + data.againstVotes + data.abstainVotes;

  return {
    ...data,
    segments: computeSegments(data, isHybrid),
    hasVotes: total > 0 || isHybrid,
  };
}
