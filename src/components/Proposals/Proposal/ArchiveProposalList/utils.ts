import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import {
  STATUS_LABEL_MAP,
  convertToNumber,
  deriveTimeStatus,
  deriveStatus,
  deriveProposalTag,
} from "@/lib/proposals";
import {
  isDaoNodeSource,
  isHybridProposal,
  getVotingData,
} from "@/lib/proposals/extractors/guards";
import { getProposalTypeText } from "@/lib/utils";
import { ProposalType } from "@/lib/types";
import { RowDisplayData } from "./types";

/**
 * Truncate long titles for display
 */
export const truncateTitle = (value: string, maxLength = 80) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

// Re-export guards for convenience
export { isDaoNodeSource, isHybridProposal, getVotingData };

/**
 * Extract common display data from a proposal
 */
export function extractDisplayData(
  proposal: ArchiveListProposal,
  proposalType: ProposalType,
  tokenDecimals: number
): RowDisplayData {
  const status = deriveStatus(proposal, tokenDecimals);
  const normalizedStatus = STATUS_LABEL_MAP[status] ? status : "UNKNOWN";
  const proposalTag = deriveProposalTag(proposal);

  // Get proposer info - handle different sources
  let proposerAddress = proposal.proposer || "";
  let proposerEns: string | undefined;

  if (isDaoNodeSource(proposal) && proposal.govless_proposal) {
    proposerAddress =
      proposerAddress ||
      proposal.govless_proposal.attester ||
      proposal.govless_proposal.proposer ||
      "";

    proposerEns = proposal.proposer_ens
      ? typeof proposal.proposer_ens === "string"
        ? proposal.proposer_ens
        : (proposal.proposer_ens?.detail ?? undefined)
      : typeof proposal.govless_proposal.proposer_ens === "string"
        ? proposal.govless_proposal.proposer_ens
        : (proposal.govless_proposal.proposer_ens?.detail ?? undefined);
  } else {
    proposerEns = proposal.proposer_ens
      ? typeof proposal.proposer_ens === "string"
        ? proposal.proposer_ens
        : (proposal.proposer_ens?.detail ?? undefined)
      : undefined;
  }

  // Check for pending proposal type approval (eas-oodao specific)
  const hasPendingRanges = proposal.proposal_type_approval === "PENDING";

  return {
    id: proposal.id,
    href: `/proposals/${proposal.id}`,
    title: proposal.title || "Untitled Proposal",
    proposerAddress,
    proposerEns,
    statusLabel: STATUS_LABEL_MAP[normalizedStatus],
    proposalTypeName: getProposalTypeText(proposalType),
    proposalTypeTag: proposalTag,
    source: proposal.data_eng_properties?.source,
    hasPendingRanges,
    timeStatus: deriveTimeStatus(proposal, normalizedStatus),
  };
}

/**
 * Ensure percentage is within valid bounds
 */
export const ensurePercentage = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

// Re-export commonly used utilities
export { convertToNumber, deriveStatus, STATUS_LABEL_MAP };
