import { ethers } from "ethers";
import { NOUNS_GOVERNOR_CURRENT } from "./contracts/contracts";
import { Prisma } from "@prisma/client";
import provider from "@/app/lib/provider";

/**
 *
 *
 *
 **/
export async function getQuorumForProposal(
  proposal: Prisma.ProposalsListGetPayload<true>,
  dao: "OPTIMISM" | "NOUNS"
) {
  switch (dao) {
    case "NOUNS": {
      let result = 0;
      let contract = new ethers.Contract(
        NOUNS_GOVERNOR_CURRENT.address,
        NOUNS_GOVERNOR_CURRENT.abi,
        provider
      );
      result = await contract.quorumVotes(proposal.proposal_id);
      return Number(result);
    }
    case "OPTIMISM": {
      return 30;
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
