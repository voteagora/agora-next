/**
 * Archive proposal utilities
 *
 * This file re-exports utilities from @/lib/proposals for backward compatibility.
 * New code should import directly from @/lib/proposals.
 *
 * @deprecated Import from @/lib/proposals instead
 */

// Re-export all utilities from the centralized location
export {
  // Converters
  convertToNumber,
  extractVoteValue,
  safeBigInt,
  safeBigIntOrNull,
  toDate,
  deriveTimeStatus,
  // Thresholds
  extractThresholds,
  resolveArchiveThresholds,
  // Formatting
  STATUS_LABEL_MAP,
  formatArchiveTagLabel,
  formatVotingModuleName,
  deriveProposalTag,
  // Status derivation
  deriveStatus,
} from "@/lib/proposals";
