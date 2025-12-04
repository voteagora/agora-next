import {
  ArchiveListProposal,
  GovlessProposal,
} from "@/lib/types/archiveProposal";
import {
  STATUS_LABEL_MAP,
  convertToNumber,
  deriveTimeStatus,
  deriveProposalTag,
} from "../Archive/archiveProposalUtils";
import { getProposalTypeText } from "@/lib/utils";
import { ProposalType } from "@/lib/types";
import { RowDisplayData } from "./types";

/**
 * Truncate long titles for display
 */
export const truncateTitle = (value: string, maxLength = 80) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

/**
 * Get the voting data source - for hybrid proposals, use govless_proposal
 */
export function getVotingData(
  proposal: ArchiveListProposal
): ArchiveListProposal | GovlessProposal {
  return proposal.hybrid && proposal.govless_proposal
    ? proposal.govless_proposal
    : proposal;
}

/**
 * Extract common display data from a proposal
 */
export function extractDisplayData(
  proposal: ArchiveListProposal,
  proposalType: ProposalType,
  tokenDecimals: number
): RowDisplayData {
  const status = proposal.lifecycle_stage;
  const normalizedStatus = STATUS_LABEL_MAP[
    status as keyof typeof STATUS_LABEL_MAP
  ]
    ? status
    : "UNKNOWN";
  const proposalTag = deriveProposalTag(proposal);
  const votingData = getVotingData(proposal);

  // Get proposer info
  const proposerAddress =
    proposal.proposer ||
    proposal.govless_proposal?.attester ||
    proposal.govless_proposal?.proposer ||
    "";

  const proposerEns = proposal.proposer_ens
    ? typeof proposal.proposer_ens === "string"
      ? proposal.proposer_ens
      : (proposal.proposer_ens?.detail ?? undefined)
    : typeof proposal.govless_proposal?.proposer_ens === "string"
      ? proposal.govless_proposal.proposer_ens
      : (proposal.govless_proposal?.proposer_ens?.detail ?? undefined);

  const vd = votingData as ArchiveListProposal;
  const hasPendingRanges = vd.proposal_type_approval === "PENDING";

  return {
    id: proposal.id,
    href: `/proposals/${proposal.id}`,
    title: proposal.title || "Untitled Proposal",
    proposerAddress,
    proposerEns,
    statusLabel:
      STATUS_LABEL_MAP[normalizedStatus as keyof typeof STATUS_LABEL_MAP] ??
      "UNKNOWN",
    proposalTypeName: getProposalTypeText(proposalType),
    proposalTypeTag: proposalTag,
    source: proposal.data_eng_properties?.source,
    hasPendingRanges,
    timeStatus: deriveTimeStatus(
      proposal,
      normalizedStatus as keyof typeof STATUS_LABEL_MAP
    ),
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
export { convertToNumber, STATUS_LABEL_MAP };
