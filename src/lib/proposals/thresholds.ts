import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { safeBigInt } from "./converters";

/**
 * Threshold extraction utilities for archive proposals
 */

// Default thresholds if not specified in proposal type
const DEFAULT_QUORUM_PERCENT = 4;
const DEFAULT_APPROVAL_THRESHOLD_PERCENT = 50;

export interface ProposalThresholds {
  quorum: number;
  approvalThreshold: number;
}

/**
 * Extract quorum and approval threshold from proposal
 * If default_proposal_type_ranges exists, the proposal is pending approval (use min values)
 * Otherwise, use the fixed values from proposal_type
 * Returns percentages (0-100)
 */
export const extractThresholds = (
  proposal: ArchiveListProposal
): ProposalThresholds => {
  const proposalType = proposal.proposal_type;
  const defaultProposalTypeRanges = proposal.default_proposal_type_ranges;

  // If default_proposal_type_ranges exists, proposal is pending approval - use min values
  if (
    defaultProposalTypeRanges &&
    typeof defaultProposalTypeRanges === "object"
  ) {
    return {
      quorum: defaultProposalTypeRanges.min_quorum_pct / 100,
      approvalThreshold:
        defaultProposalTypeRanges.min_approval_threshold_pct / 100,
    };
  }

  // Handle FixedProposalType (eas-oodao) - proposal type is approved
  if (
    typeof proposalType === "object" &&
    proposalType !== null &&
    "quorum" in proposalType
  ) {
    return {
      quorum: proposalType.quorum / 100, // Convert basis points to percentage
      approvalThreshold: proposalType.approval_threshold / 100,
    };
  }

  // Handle number type (dao_node) or unknown - use defaults
  return {
    quorum: DEFAULT_QUORUM_PERCENT,
    approvalThreshold: DEFAULT_APPROVAL_THRESHOLD_PERCENT,
  };
};

export interface ResolvedThresholds {
  quorum: bigint;
  approvalThreshold: bigint;
  votableSupply: bigint;
}

/**
 * Resolve thresholds with votable supply for archive proposals
 * Handles different data sources (eas-oodao vs dao_node)
 */
export const resolveArchiveThresholds = (
  proposal: ArchiveListProposal
): ResolvedThresholds => {
  const source = proposal.data_eng_properties?.source;

  const resolveFromEas = () => {
    const type = proposal.proposal_type;
    if (!type || typeof type !== "object") {
      return {
        quorum: safeBigInt(0),
        approvalThreshold: safeBigInt(0),
      };
    }

    return {
      quorum: safeBigInt(type.quorum ?? 0),
      approvalThreshold: safeBigInt(type.approval_threshold ?? 0),
    };
  };

  const quotaValues =
    source === "eas-oodao"
      ? resolveFromEas()
      : {
          quorum: safeBigInt(proposal.quorum ?? proposal.quorumVotes ?? 0),
          approvalThreshold: safeBigInt(proposal.approval_threshold ?? 0),
        };

  const totalVotingPowerRaw = safeBigInt(
    proposal.total_voting_power_at_start ?? 0
  );

  let quorumValue = quotaValues.quorum / 100n;

  if (source === "eas-oodao" && quorumValue > 0n && totalVotingPowerRaw > 0n) {
    quorumValue = (totalVotingPowerRaw * quorumValue) / 100n;
  }

  const votableSupply = safeBigInt(proposal.total_voting_power_at_start ?? 0);

  return {
    quorum: quorumValue,
    approvalThreshold: quotaValues.approvalThreshold,
    votableSupply,
  };
};
