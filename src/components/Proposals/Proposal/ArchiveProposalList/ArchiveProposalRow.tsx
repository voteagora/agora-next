"use client";

import { deriveProposalType } from "@/lib/types/archiveProposal";
import { StandardProposalRow } from "./StandardProposalRow";
import { ApprovalProposalRow } from "./ApprovalProposalRow";
import { OptimisticProposalRow } from "./OptimisticProposalRow";
import { OptimisticTieredProposalRow } from "./OptimisticTieredProposalRow";
import { SnapshotProposalRow } from "./SnapshotProposalRow";
import { ArchiveRowProps } from "./types";

/**
 * Unsupported proposal type fallback
 */
function UnsupportedProposalRow({ proposal }: ArchiveRowProps) {
  return (
    <div className="border-b border-line items-center flex flex-row bg-neutral py-4 px-6">
      <div className="text-xs text-secondary">
        Unsupported proposal type: {proposal.id}
      </div>
    </div>
  );
}

/**
 * Router component that renders the appropriate row component based on proposal type.
 * Each row component handles its own transformations and metrics calculations.
 */
export function ArchiveProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  // Derive the proposal type from raw data
  const proposalType = deriveProposalType(proposal);
  // Route to the appropriate row component
  switch (proposalType) {
    case "SNAPSHOT":
      return <SnapshotProposalRow proposal={proposal} />;
    // Standard variants
    case "STANDARD":
    case "HYBRID_STANDARD":
    case "OFFCHAIN_STANDARD":
      return (
        <StandardProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
          proposalType={proposalType}
        />
      );

    // Approval variants
    case "APPROVAL":
    case "HYBRID_APPROVAL":
    case "OFFCHAIN_APPROVAL":
      return (
        <ApprovalProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
        />
      );

    // Optimistic variants (non-tiered)
    case "OPTIMISTIC":
    case "HYBRID_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC":
      return (
        <OptimisticProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
        />
      );

    // Optimistic tiered variants
    case "HYBRID_OPTIMISTIC_TIERED":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      return (
        <OptimisticTieredProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
        />
      );

    // Fallback for unsupported types
    default:
      return <UnsupportedProposalRow proposal={proposal} />;
  }
}

export default ArchiveProposalRow;
