import type { Proposal } from "@/app/api/common/proposals/proposal";

import { fromLegacyProposalType } from "./taxonomy";

type ProposalLike = Pick<Proposal, "kind" | "proposalType">;

export function resolveProposalKind(proposal: ProposalLike) {
  if (proposal.kind) {
    return proposal.kind;
  }

  if (!proposal.proposalType) {
    return null;
  }

  return fromLegacyProposalType(proposal.proposalType);
}

export function isSnapshotProposal(proposal: ProposalLike): boolean {
  return resolveProposalKind(proposal)?.votingKind === "snapshot";
}

export function isHybridProposal(proposal: ProposalLike): boolean {
  return resolveProposalKind(proposal)?.scope === "hybrid";
}

export function isApprovalProposal(proposal: ProposalLike): boolean {
  return resolveProposalKind(proposal)?.votingKind === "approval";
}

export function isOptimisticProposal(proposal: ProposalLike): boolean {
  return resolveProposalKind(proposal)?.votingKind === "optimistic";
}

export function isStandardProposal(proposal: ProposalLike): boolean {
  return resolveProposalKind(proposal)?.votingKind === "standard";
}

export function isGovlessOffchainProposal(proposal: ProposalLike): boolean {
  const kind = resolveProposalKind(proposal);

  if (!kind) {
    return false;
  }

  return kind.scope === "offchain" && kind.votingKind !== "snapshot";
}
