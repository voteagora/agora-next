// Main entry point for archive proposal list components

// Router component (use this for rendering)
export { ArchiveProposalRow } from "./ArchiveProposalRow";

// Individual row components (for direct usage if needed)
export { StandardProposalRow } from "./StandardProposalRow";
export { ApprovalProposalRow } from "./ApprovalProposalRow";
export { OptimisticProposalRow } from "./OptimisticProposalRow";
export { OptimisticTieredProposalRow } from "./OptimisticTieredProposalRow";
export { SnapshotProposalRow } from "./SnapshotProposalRow";

// Shared components
export { BaseRowLayout } from "./BaseRowLayout";

// Types
export type { ArchiveRowProps, RowDisplayData } from "./types";

// Utils
export {
  truncateTitle,
  getVotingData,
  extractDisplayData,
  ensurePercentage,
  convertToNumber,
  deriveStatus,
  STATUS_LABEL_MAP,
} from "./utils";
