/**
 * Type guards for archive proposals
 *
 * These guards work with both ArchiveProposalBySource (discriminated union)
 * and ArchiveListProposal (legacy type) to enable type-safe field access.
 */

import type {
  ArchiveListProposal,
  ArchiveProposalBySource,
  DaoNodeProposal,
  EasAtlasProposal,
  EasOodaoProposal,
  DaoNodeVoteTotals,
  EasAtlasVoteOutcome,
  EasOodaoVoteOutcome,
  GovlessProposal,
} from "@/lib/types/archiveProposal";
import type { ArchiveProposalInput } from "./types";

// =============================================================================
// Source Type Guards
// =============================================================================

/**
 * Check if proposal is from dao_node source
 */
export function isDaoNodeSource(
  proposal: ArchiveProposalInput
): proposal is DaoNodeProposal & {
  data_eng_properties: { source: "dao_node" };
} {
  return proposal.data_eng_properties?.source === "dao_node";
}

/**
 * Check if proposal is from eas-atlas source
 */
export function isEasAtlasSource(
  proposal: ArchiveProposalInput
): proposal is EasAtlasProposal & {
  data_eng_properties: { source: "eas-atlas" };
} {
  return proposal.data_eng_properties?.source === "eas-atlas";
}

/**
 * Check if proposal is from eas-oodao source
 */
export function isEasOodaoSource(
  proposal: ArchiveProposalInput
): proposal is EasOodaoProposal & {
  data_eng_properties: { source: "eas-oodao" };
} {
  return proposal.data_eng_properties?.source === "eas-oodao";
}

/**
 * Check if proposal is from snapshot source
 */
export function isSnapshotSource(proposal: ArchiveProposalInput): boolean {
  return proposal.data_eng_properties?.source === "snapshot";
}

// =============================================================================
// Hybrid Proposal Guards
// =============================================================================

/**
 * Check if proposal is a hybrid proposal (has govless_proposal)
 */
export function isHybridProposal(
  proposal: ArchiveProposalInput
): proposal is ArchiveListProposal & {
  hybrid: true;
  govless_proposal: GovlessProposal;
} {
  return (
    "hybrid" in proposal &&
    proposal.hybrid === true &&
    "govless_proposal" in proposal &&
    !!proposal.govless_proposal
  );
}

/**
 * Get the voting data source for a proposal.
 * For hybrid proposals, returns the govless_proposal.
 * For non-hybrid, returns the proposal itself.
 */
export function getVotingData(
  proposal: ArchiveProposalInput
): ArchiveListProposal | GovlessProposal {
  if (isHybridProposal(proposal)) {
    return proposal.govless_proposal;
  }
  return proposal as ArchiveListProposal;
}

// =============================================================================
// Vote Data Type Guards
// =============================================================================

/**
 * Check if proposal has dao_node vote totals
 */
export function hasDaoNodeTotals(
  proposal: ArchiveProposalInput
): proposal is ArchiveListProposal & { totals: DaoNodeVoteTotals } {
  return (
    "totals" in proposal &&
    proposal.totals !== undefined &&
    "no-param" in (proposal.totals as DaoNodeVoteTotals)
  );
}

/**
 * Check if proposal has eas-atlas vote outcome
 */
export function hasEasAtlasOutcome(
  proposal: ArchiveProposalInput | GovlessProposal
): proposal is (ArchiveListProposal | GovlessProposal) & {
  outcome: EasAtlasVoteOutcome;
} {
  if (!("outcome" in proposal) || !proposal.outcome) return false;
  const outcome = proposal.outcome as Record<string, unknown>;
  // eas-atlas has USER/APP/CHAIN keys
  return "USER" in outcome || "APP" in outcome || "CHAIN" in outcome;
}

/**
 * Check if proposal has eas-oodao vote outcome
 */
export function hasEasOodaoOutcome(
  proposal: ArchiveProposalInput
): proposal is ArchiveListProposal & { outcome: EasOodaoVoteOutcome } {
  if (!("outcome" in proposal) || !proposal.outcome) return false;
  const outcome = proposal.outcome as Record<string, unknown>;
  // eas-oodao has token-holders key
  return "token-holders" in outcome;
}

// =============================================================================
// Voting Module Guards
// =============================================================================

/**
 * Check if proposal uses standard voting module
 */
export function isStandardVoting(proposal: ArchiveProposalInput): boolean {
  if (isDaoNodeSource(proposal)) {
    return (
      proposal.voting_module_name === "standard" ||
      proposal.voting_module_name === undefined
    );
  }
  if (isEasAtlasSource(proposal)) {
    return proposal.proposal_type === "STANDARD";
  }
  if (isEasOodaoSource(proposal)) {
    return proposal.proposal_type.class === "STANDARD";
  }
  return false;
}

/**
 * Check if proposal uses approval voting module
 */
export function isApprovalVoting(proposal: ArchiveProposalInput): boolean {
  if (isDaoNodeSource(proposal)) {
    return proposal.voting_module_name === "approval";
  }
  if (isEasAtlasSource(proposal)) {
    return proposal.proposal_type === "APPROVAL";
  }
  if (isEasOodaoSource(proposal)) {
    return proposal.proposal_type.class === "APPROVAL";
  }
  return false;
}

/**
 * Check if proposal uses optimistic voting module
 */
export function isOptimisticVoting(proposal: ArchiveProposalInput): boolean {
  if (isDaoNodeSource(proposal)) {
    return proposal.voting_module_name === "optimistic";
  }
  if (isEasAtlasSource(proposal)) {
    return (
      proposal.proposal_type === "OPTIMISTIC" ||
      proposal.proposal_type === "OPTIMISTIC_TIERED"
    );
  }
  if (isEasOodaoSource(proposal)) {
    return proposal.proposal_type.class === "OPTIMISTIC";
  }
  return false;
}

/**
 * Check if proposal is optimistic tiered
 */
export function isOptimisticTiered(proposal: ArchiveProposalInput): boolean {
  if (isEasAtlasSource(proposal)) {
    return (
      proposal.proposal_type === "OPTIMISTIC_TIERED" ||
      (proposal.tiers?.length ?? 0) > 0
    );
  }
  if (isHybridProposal(proposal) && proposal.govless_proposal) {
    const gp = proposal.govless_proposal;
    return (gp.tiers?.length ?? 0) > 0;
  }
  return false;
}
