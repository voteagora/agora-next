import type { ComponentType } from "react";

import type { Proposal } from "@/app/api/common/proposals/proposal";
import type { ProposalType } from "@/lib/types";

import HybridStandardProposalStatus from "./HybridStandardProposalStatus";
import OPApprovalProposalStatus, {
  OffchainApprovalProposalStatus,
} from "./OPApprovalProposalStatus";
import OPOptimisticProposalStatus from "./OPOptimisticProposalStatus";
import OPStandardProposalStatus from "./OPStandardProposalStatus";
import SnapshotProposalStatus from "./SnapshotProposalStatus";
import { HybridOptimisticProposalStatus } from "./HybridOptimisticProposalStatus";

export type ProposalListStatusProps = {
  proposal: Proposal;
  votableSupply: string;
};

export type ProposalListStatusComponent =
  ComponentType<ProposalListStatusProps>;

const SnapshotStatus: ProposalListStatusComponent = ({ proposal }) => (
  <SnapshotProposalStatus proposal={proposal} />
);

const StandardStatus: ProposalListStatusComponent = ({ proposal }) => (
  <OPStandardProposalStatus proposal={proposal} />
);

const OptimisticStatus: ProposalListStatusComponent = ({
  proposal,
  votableSupply,
}) => (
  <OPOptimisticProposalStatus
    proposal={proposal}
    votableSupply={votableSupply}
  />
);

const ApprovalStatus: ProposalListStatusComponent = ({ proposal }) => (
  <OPApprovalProposalStatus proposal={proposal} />
);

const OffchainApprovalStatus: ProposalListStatusComponent = ({ proposal }) => (
  <OffchainApprovalProposalStatus proposal={proposal} />
);

const HybridStandardStatus: ProposalListStatusComponent = ({ proposal }) => (
  <HybridStandardProposalStatus proposal={proposal} />
);

const HybridOptimisticStatus: ProposalListStatusComponent = ({ proposal }) => (
  <HybridOptimisticProposalStatus proposal={proposal} />
);

export const PROPOSAL_LIST_STATUS_REGISTRY: Partial<
  Record<ProposalType, ProposalListStatusComponent>
> = {
  SNAPSHOT: SnapshotStatus,
  STANDARD: StandardStatus,
  OPTIMISTIC: OptimisticStatus,
  APPROVAL: ApprovalStatus,
  HYBRID_APPROVAL: ApprovalStatus,
  OFFCHAIN_APPROVAL: OffchainApprovalStatus,
  HYBRID_STANDARD: HybridStandardStatus,
  OFFCHAIN_STANDARD: HybridStandardStatus,
  HYBRID_OPTIMISTIC_TIERED: HybridOptimisticStatus,
  OFFCHAIN_OPTIMISTIC: HybridOptimisticStatus,
  OFFCHAIN_OPTIMISTIC_TIERED: HybridOptimisticStatus,
};

export function getProposalListStatusComponent(
  proposal: Proposal
): ProposalListStatusComponent | null {
  if (!proposal.proposalType) {
    return null;
  }

  return PROPOSAL_LIST_STATUS_REGISTRY[proposal.proposalType] ?? null;
}
