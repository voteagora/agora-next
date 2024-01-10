import provider from "@/app/lib/provider";
import { NounsContracts, OptimismContracts } from "./contracts/contracts";
import { Prisma } from "@prisma/client";
import { DEPLOYMENT_NAME } from "./config";
import prisma from "@/app/lib/prisma";

export const getQuorum = async (proposal: Prisma.ProposalsGetPayload<true>) => {
  let quorum = await getQuorumForProposal(proposal);

  if (!quorum) {
    const votableSupply = await prisma.votableSupply.findFirst({});

    quorum = (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
  }

  return quorum;
};

/**
 *
 *
 *
 **/
export async function getQuorumForProposal(
  proposal: Prisma.ProposalsGetPayload<true> | null
) {
  switch (DEPLOYMENT_NAME) {
    case "nouns": {
      if (!proposal) {
        return null;
      }
      return NounsContracts.governor.contract.quorumVotes(proposal.proposal_id);
    }
    case "optimism": {
      if (!proposal?.start_block) {
        return null;
      }
      return OptimismContracts.governor.contract.quorum(
        // TODO: Remove after governor update
        process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
          ? proposal.start_block
          : proposal.proposal_id
      );
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
      return OptimismContracts.governor.contract.quorum(latestBlock.number - 1);
    }
  }
}
