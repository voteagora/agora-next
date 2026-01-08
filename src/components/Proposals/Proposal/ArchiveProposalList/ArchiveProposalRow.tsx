"use client";

import { deriveProposalType } from "@/lib/types/archiveProposal";
import { StandardProposalRow } from "./StandardProposalRow";
import { SnapshotProposalRow } from "./SnapshotProposalRow";
import { ApprovalProposalRow } from "./ApprovalProposalRow";
import { OptimisticProposalRow } from "./OptimisticProposalRow";
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
    // Standard / eas-oodao variants
    // We currently only support snapshot, standard onchain, and eas-oodao proposals
    // All standard-like variants are rendered using StandardProposalRow
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
    case "APPROVAL":
      return (
        <ApprovalProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
          proposalType={proposalType}
        />
      );

    case "OPTIMISTIC":
      return (
        <OptimisticProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
          proposalType={proposalType}
        />
      );

    // Fallback for unsupported types
    default:
      return <UnsupportedProposalRow proposal={proposal} />;
  }
}

export default ArchiveProposalRow;
