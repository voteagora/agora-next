import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { LegacyProposalType } from "@/lib/types";
import { isEasOodaoSource } from "./extractors/guards";

/**
 * Formatting utilities for archive proposals
 */

const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLocaleLowerCase();

/**
 * Map of status codes to display labels
 */
export const STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  SUCCEEDED: "Succeeded",
  EXECUTED: "Executed",
  DEFEATED: "Defeated",
  QUEUED: "Queued",
  CANCELLED: "Cancelled",
  PASSED: "Passed",
  FAILED: "Failed",
  CLOSED: "Closed",
  UNKNOWN: "Unknown",
};

/**
 * Format archive tag label for display
 * Normalizes common tag variations
 */
export const formatArchiveTagLabel = (tag?: string | null): string | null => {
  if (!tag) {
    return null;
  }

  const normalized = tag.toLowerCase();
  if (normalized === "tempcheck" || normalized === "temp-check") {
    return "Temp Check";
  }

  if (normalized === "gov-proposal" || normalized === "govproposal") {
    return "Gov Proposal";
  }

  return tag;
};

/**
 * Format voting module name for display
 */
export const formatVotingModuleName = (name?: string | null): string => {
  if (!name) {
    return "Governance";
  }

  const cleaned = name.replace(/_/g, " ").trim();
  return cleaned ? capitalizeFirstLetter(cleaned) : "Governance";
};

export const getProposalTypeText = (
  proposalType: LegacyProposalType | string,
  proposalData?: ParsedProposalData["SNAPSHOT"]["kind"]
) => {
  switch (proposalType) {
    case "OPTIMISTIC":
      return "Optimistic Proposal";
    case "STANDARD":
      return "Standard Proposal";
    case "APPROVAL":
      return "Approval Vote Proposal";
    case "SNAPSHOT":
      if (proposalData?.type === "copeland") {
        return "Ranked Choice Proposal";
      }
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      return "Optimistic Proposal (Offchain)";
    case "OFFCHAIN_STANDARD":
      return "Standard Proposal (Offchain)";
    case "OFFCHAIN_APPROVAL":
      return "Approval Vote Proposal (Offchain)";
    case "HYBRID_STANDARD":
      return "Joint House Standard Proposal";
    case "HYBRID_APPROVAL":
      return "Joint House Approval Proposal";
    case "HYBRID_OPTIMISTIC":
    case "HYBRID_OPTIMISTIC_TIERED":
      return "Joint House Optimistic Proposal";
    default:
      return "Proposal";
  }
};

/**
 * Derive the display tag for a proposal
 * Falls back to "Governance" if no tag is available
 */
export const deriveProposalTag = (proposal: ArchiveListProposal): string => {
  // Only eas-oodao proposals have tags
  if (isEasOodaoSource(proposal) && Array.isArray(proposal.tags)) {
    const rawTag = proposal.tags[0];
    const formattedTag = formatArchiveTagLabel(rawTag);
    if (formattedTag) {
      return formattedTag;
    }
    if (rawTag) {
      return rawTag;
    }
  }

  return "Governance";
};
