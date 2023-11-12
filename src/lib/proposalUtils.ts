import { Prisma } from "@prisma/client";
import { NounsContracts, OptimismContracts } from "./contracts/contracts";

/**
 *
 *
 *
 **/
export async function getQuorumForProposal(
  proposal: Prisma.ProposalsListGetPayload<true> | null,
  dao: "OPTIMISM" | "NOUNS"
) {
  switch (dao) {
    case "NOUNS": {
      if (!proposal) {
        return null;
      }
      return NounsContracts.governor.quorumVotes(proposal.proposal_id);
    }
    case "OPTIMISM": {
      if (!proposal?.start_block) {
        return null;
      }
      return OptimismContracts.governor.quorum(proposal.start_block);
    }
  }
}

export function parseProposalType(
  proposalData: string
): "STANDARD" | "APPROVAL" {
  const data = JSON.parse(proposalData);
  if (Array.isArray(data)) {
    return "APPROVAL";
  }
  return "STANDARD";
}
