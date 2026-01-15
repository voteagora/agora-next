import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { ProposalType } from "@/lib/types";

/**
 * Props for archive proposal row components
 */
export type ArchiveRowProps = {
  proposal: ArchiveListProposal;
  tokenDecimals?: number;
  /** Derived proposal type (e.g., STANDARD, HYBRID_STANDARD, etc.) */
  proposalType?: ProposalType;
};

/**
 * Common row data extracted from proposal
 */
export type RowDisplayData = {
  id: string;
  href: string;
  title: string;
  proposerAddress: string;
  proposerEns?: string;
  statusLabel: string;
  proposalTypeName: string;
  proposalTypeTag?: string;
  source?: string;
  timeStatus: {
    proposalStatus: string;
    proposalStartTime: Date | null;
    proposalEndTime: Date | null;
    proposalCancelledTime: Date | null;
    proposalExecutedTime: Date | null;
  };
};
