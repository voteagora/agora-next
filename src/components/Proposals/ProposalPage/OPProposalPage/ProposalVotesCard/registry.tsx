import type { ComponentType } from "react";

import type { Proposal } from "@/app/api/common/proposals/proposal";
import type { ProposalType } from "@/lib/types";

import OffChainOptimisticProposalVotesCard from "./OffChainOptimisticProposalVotesCard";
import OptimisticTieredProposalVotesCard from "./OptimisticTieredProposalVotesCard";

export type ProposalVotesCardProps = {
  proposal: Proposal;
};

export type ProposalVotesCardComponent = ComponentType<ProposalVotesCardProps>;

export const HYBRID_OPTIMISTIC_VOTES_CARD_REGISTRY: Partial<
  Record<ProposalType, ProposalVotesCardComponent>
> = {
  HYBRID_OPTIMISTIC: OptimisticTieredProposalVotesCard,
  HYBRID_OPTIMISTIC_TIERED: OptimisticTieredProposalVotesCard,
  OFFCHAIN_OPTIMISTIC: OffChainOptimisticProposalVotesCard,
  OFFCHAIN_OPTIMISTIC_TIERED: OffChainOptimisticProposalVotesCard,
};

export function getHybridOptimisticVotesCardComponent(
  proposal: Proposal
): ProposalVotesCardComponent | null {
  if (!proposal.proposalType) {
    return null;
  }

  return HYBRID_OPTIMISTIC_VOTES_CARD_REGISTRY[proposal.proposalType] ?? null;
}
