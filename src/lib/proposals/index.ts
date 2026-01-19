/**
 * Proposal utilities
 *
 * Central module for proposal normalization and extraction.
 */

// Main normalization function
export { archiveToProposal } from "./normalizeArchive";
export type { NormalizeArchiveOptions } from "./normalizeArchive";

// Extractors
export {
  // Types
  type VoteData,
  type RawVoteData,
  type VoteDataWithRaw,
  type StandardMetrics,
  type StandardVoteSegments,
  type ApprovalChoice,
  type ApprovalMetrics,
  type OptimisticMetrics,
  type OptimisticTieredMetrics,
  type ArchiveProposalInput,
  type ExtractorOptions,
  // Guards
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
  // Extractors
  extractStandardMetrics,
  extractApprovalMetrics,
  extractOptimisticMetrics,
  extractOptimisticTieredMetrics,
  // Utilities (note: convertToNumber is exported from ./converters instead)
  ensurePercentage,
} from "./extractors";

// Converters
export {
  convertToNumber,
  safeBigInt,
  safeBigIntOrNull,
  toDate,
  deriveTimeStatus,
} from "./converters";

// Thresholds
export {
  extractThresholds,
  resolveArchiveThresholds,
  type ProposalThresholds,
  type ResolvedThresholds,
} from "./thresholds";

// Formatting
export {
  STATUS_LABEL_MAP,
  formatArchiveTagLabel,
  formatVotingModuleName,
  deriveProposalTag,
} from "./formatting";

// Status derivation
export {
  deriveStatus,
  deriveOptimisticStatus,
  deriveApprovalStatus,
  deriveStandardStatus,
} from "./status";
