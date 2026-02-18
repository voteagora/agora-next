/**
 * Proposal Page Component Registry
 *
 * Maps proposal types to their corresponding page components.
 * This eliminates the need for large switch statements in page.tsx.
 */

import type { ComponentType } from "react";
import type { Proposal } from "@/app/api/common/proposals/proposal";
import type { ProposalType } from "@/lib/types";

// Lazy imports to reduce bundle size
import dynamic from "next/dynamic";

// =============================================================================
// Component Types
// =============================================================================

export type ProposalPageProps = {
  proposal: Proposal;
};

export type ProposalPageComponent = ComponentType<ProposalPageProps>;

// =============================================================================
// Lazy-loaded Components
// =============================================================================

const StandardProposalPage = dynamic(
  () => import("./OPProposalPage/StandardProposalPage")
);

const OODaoStandardProposalPage = dynamic(
  () => import("./OPProposalPage/OODaoStandardProposalPage")
);

const HybridStandardProposalPage = dynamic(
  () => import("./OPProposalPage/HybridStandardProposalPage")
);

const OPProposalApprovalPage = dynamic(
  () => import("./OPProposalApprovalPage/OPProposalApprovalPage")
);

const HybridApprovalProposalPage = dynamic(
  () => import("./OPProposalApprovalPage/HybridApprovalProposalPage")
);

const OPProposalOptimisticPage = dynamic(
  () => import("./OPProposalPage/OPProposalOptimisticPage")
);

const OODaoOptimisticProposalPage = dynamic(
  () => import("./OPProposalPage/OODaoOptimisticProposalPage")
);

const HybridOptimisticProposalPage = dynamic(
  () => import("./OPProposalPage/HybridOptimisticProposalPage")
);

const CopelandProposalPage = dynamic(
  () => import("./CopelandProposalPage/CopelandProposalPage")
);

const OODaoApprovalProposalPage = dynamic(
  () => import("./OPProposalApprovalPage/OODaoApprovalProposalPage")
);

// =============================================================================
// Registry
// =============================================================================

/**
 * Registry mapping proposal types to page components.
 *
 * Usage:
 * ```tsx
 * const Component = PROPOSAL_PAGE_REGISTRY[proposal.proposalType];
 * return <Component proposal={proposal} />;
 * ```
 */
export const PROPOSAL_PAGE_REGISTRY: Partial<
  Record<ProposalType, ProposalPageComponent>
> = {
  // Standard variants
  STANDARD: StandardProposalPage,
  HYBRID_STANDARD: HybridStandardProposalPage,
  OFFCHAIN_STANDARD: HybridStandardProposalPage,

  // Approval variants
  APPROVAL: OPProposalApprovalPage,
  HYBRID_APPROVAL: HybridApprovalProposalPage,
  OFFCHAIN_APPROVAL: HybridApprovalProposalPage,

  // Optimistic variants
  OPTIMISTIC: OODaoOptimisticProposalPage,
  HYBRID_OPTIMISTIC: HybridOptimisticProposalPage,
  OFFCHAIN_OPTIMISTIC: HybridOptimisticProposalPage,
  HYBRID_OPTIMISTIC_TIERED: HybridOptimisticProposalPage,
  OFFCHAIN_OPTIMISTIC_TIERED: HybridOptimisticProposalPage,

  // Snapshot - handled specially for Copeland
  SNAPSHOT: StandardProposalPage,
};

/**
 * OODao-specific registry for eas-oodao proposals.
 * Falls back to regular registry if not specified.
 */
export const OODAO_PROPOSAL_PAGE_REGISTRY: Partial<
  Record<ProposalType, ProposalPageComponent>
> = {
  STANDARD: OODaoStandardProposalPage,
  OPTIMISTIC: OODaoOptimisticProposalPage,
  APPROVAL: OODaoApprovalProposalPage,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the appropriate page component for a proposal.
 *
 * @param proposal - The proposal object
 * @param useArchive - Whether to use archive-specific components
 * @returns The page component to render
 */
export function getProposalPageComponent(
  proposal: Proposal,
  useArchive: boolean = false
): ProposalPageComponent {
  const proposalType = proposal.proposalType ?? "STANDARD";
  const isOOdaoProposal = proposal.archiveMetadata?.source === "eas-oodao";

  // Check OODao registry first if archive mode is enabled and proposal is from eas-oodao
  if (
    useArchive &&
    isOOdaoProposal &&
    OODAO_PROPOSAL_PAGE_REGISTRY[proposalType]
  ) {
    return OODAO_PROPOSAL_PAGE_REGISTRY[proposalType]!;
  }

  // Fall back to regular registry
  const component = PROPOSAL_PAGE_REGISTRY[proposalType];
  if (component) {
    return component;
  }

  // Default to standard page
  return StandardProposalPage;
}

/**
 * Check if a proposal type requires special handling (e.g., Copeland).
 */
export function requiresSpecialHandling(
  proposal: Proposal
): ProposalPageComponent | null {
  // Copeland proposals are a special case of SNAPSHOT
  if (proposal.proposalType === "SNAPSHOT") {
    const proposalData = proposal.proposalData as { type?: string };
    if (proposalData?.type === "copeland") {
      return CopelandProposalPage;
    }
  }

  return null;
}
