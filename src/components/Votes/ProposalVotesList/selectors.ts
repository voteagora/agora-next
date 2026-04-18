import { VOTER_TYPES } from "@/lib/constants";
import type { Proposal } from "@/app/api/common/proposals/proposal";

import {
  isApprovalProposal,
  isGovlessOffchainProposal,
  isHybridProposal,
  isSnapshotProposal,
} from "@/features/proposals/domain";

export function getDefaultProposalVoterType(proposal: Proposal) {
  return isHybridProposal(proposal) || isGovlessOffchainProposal(proposal)
    ? VOTER_TYPES[0]
    : VOTER_TYPES[VOTER_TYPES.length - 1];
}

export function shouldShowProposalVoterTypeFilter(proposal: Proposal): boolean {
  return (
    isHybridProposal(proposal) ||
    isGovlessOffchainProposal(proposal) ||
    Boolean(proposal.offchainProposalId)
  );
}

export function isProposalOffchainVoterFilter(proposal: Proposal): boolean {
  return isGovlessOffchainProposal(proposal);
}

export function isProposalNonVoterThresholdCriteria(
  proposal: Proposal
): boolean {
  const proposalData = proposal.proposalData;

  return (
    isApprovalProposal(proposal) &&
    !isSnapshotProposal(proposal) &&
    Boolean(
      proposalData &&
        "proposalSettings" in proposalData &&
        proposalData.proposalSettings?.criteria === "THRESHOLD"
    )
  );
}

export function getProposalNonVoterListBaseHeight(
  proposal: Proposal,
  hasExtraFilterRow: boolean
): number {
  let baseHeight = 437;

  if (
    isProposalNonVoterThresholdCriteria(proposal) ||
    isSnapshotProposal(proposal)
  ) {
    baseHeight = 560;
  } else if (isApprovalProposal(proposal)) {
    baseHeight = 527;
  }

  if (hasExtraFilterRow) {
    baseHeight += 50;
  }

  return baseHeight;
}
