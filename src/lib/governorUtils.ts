import provider from "@/app/lib/provider";
import { NounsContracts, OptimismContracts } from "./contracts/contracts";
import { Prisma } from "@prisma/client";

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

export async function getCurrentQuorum(dao: "OPTIMISM") {
  switch (dao) {
    case "OPTIMISM": {
      const latestBlock = await provider.getBlock("latest");
      if (!latestBlock) {
        return null;
      }
      // latest - 1 because latest block might not be mined yet
      return OptimismContracts.governor.quorum(latestBlock.number - 1);
    }
  }
}
