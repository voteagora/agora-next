import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { safeBigInt } from "./converters";
import { isDaoNodeSource, isEasOodaoSource } from "./extractors/guards";

/**
 * Threshold extraction utilities for archive proposals
 */

// Default thresholds if not specified in proposal type
const DEFAULT_QUORUM_PERCENT = 4;
const DEFAULT_APPROVAL_THRESHOLD_PERCENT = 50;

export interface ProposalThresholds {
  quorum: number | bigint;
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
  // Handle eas-oodao proposals
  if (isEasOodaoSource(proposal)) {
    // Use fixed proposal type values - proposal_type is FixedProposalType for eas-oodao
    const propType = proposal.proposal_type as {
      quorum: number;
      approval_threshold: number;
    };
    return {
      quorum: propType.quorum / 100,
      approvalThreshold: propType.approval_threshold / 100,
    };
  }

  // Handle dao_node proposals - use defaults
  return {
    quorum: safeBigInt(proposal.quorum),
    approvalThreshold: proposal.proposal_type_info?.approval_threshold || 0,
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
  if (isEasOodaoSource(proposal)) {
    const propType = proposal.proposal_type as {
      quorum: number;
      approval_threshold: number;
    };
    const quorumBp = safeBigInt(propType.quorum ?? 0);
    const approvalThresholdBp = propType.approval_threshold ?? 0;
    const totalVotingPower = safeBigInt(
      proposal.total_voting_power_at_start ?? 0
    );

    // Convert basis points to absolute quorum: (totalVotingPower * bps) / 10000
    let quorumValue = quorumBp;
    if (quorumValue > 0n && totalVotingPower > 0n) {
      quorumValue = (totalVotingPower * quorumBp) / 10000n;
    }

    return {
      quorum: quorumValue,
      approvalThreshold: BigInt(approvalThresholdBp),
      votableSupply: totalVotingPower,
    };
  }

  if (isDaoNodeSource(proposal)) {
    return {
      quorum: safeBigInt(proposal.quorum ?? proposal.quorumVotes ?? 0),
      approvalThreshold: BigInt(
        proposal.proposal_type_info?.approval_threshold ?? 0
      ),
      votableSupply: safeBigInt(proposal.total_voting_power_at_start ?? 0),
    };
  }

  // Fallback for eas-atlas
  return {
    quorum: 0n,
    approvalThreshold: 0n,
    votableSupply: 0n,
  };
};
