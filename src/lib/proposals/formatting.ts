import { capitalizeFirstLetter } from "@/lib/utils";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { isEasOodaoSource } from "./extractors/guards";

/**
 * Formatting utilities for archive proposals
 */

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
