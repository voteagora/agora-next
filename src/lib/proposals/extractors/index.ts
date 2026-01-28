/**
 * Proposal Vote Extractors
 *
 * Type-safe extraction of vote metrics from archive proposals.
 * Uses type guards to eliminate the need for type assertions.
 *
 * Usage:
 * ```ts
 * import { extractStandardMetrics } from "@/lib/proposals/extractors";
 *
 * const metrics = extractStandardMetrics(proposal, { tokenDecimals: 18 });
 * // metrics.forVotes, metrics.segments.forPercentage, etc.
 * ```
 */

// Types
export type {
  VoteData,
  RawVoteData,
  VoteDataWithRaw,
  StandardMetrics,
  StandardVoteSegments,
  ApprovalChoice,
  ApprovalOption,
  ApprovalMetrics,
  OptimisticMetrics,
  OptimisticTieredMetrics,
  ArchiveProposalInput,
  ExtractorOptions,
} from "./types";

// Guards
export {
  isDaoNodeSource,
  isEasAtlasSource,
  isEasOodaoSource,
  isSnapshotSource,
  isHybridProposal,
  getVotingData,
  hasDaoNodeTotals,
  hasEasAtlasOutcome,
  hasEasOodaoOutcome,
  isStandardVoting,
  isApprovalVoting,
  isOptimisticVoting,
  isOptimisticTiered,
} from "./guards";

// Standard extractors
export {
  extractStandardMetrics,
  extractFromDaoNodeTotals,
  extractFromEasOodao,
  aggregateOffchainVotes,
  extractHybridVotes,
  computeSegments,
  convertToNumber,
  ensurePercentage,
  calcWeightedPercentage,
} from "./standard";

// Approval extractors
export { extractApprovalMetrics } from "./approval";

// Optimistic extractors
export {
  extractOptimisticMetrics,
  extractOptimisticTieredMetrics,
} from "./optimistic";
