import provider from "@/app/lib/provider";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { DEPLOYMENT_NAME } from "@/lib/config";
import { NounsContracts, OptimismContracts } from "@/lib/contracts/contracts";

export async function getQuorumForProposal(
  proposal: Prisma.ProposalsGetPayload<true>
) {
  switch (DEPLOYMENT_NAME) {
    case "nouns": {
      if (!proposal) {
        return null;
      }
      return NounsContracts.governor.contract.quorumVotes(proposal.proposal_id);
    }
    case "optimism": {
      const contractQuorum = OptimismContracts.governor.contract.quorum(
        proposal.proposal_id
      );

      // If no quorum is set, calculate it based on votable supply
      if (!contractQuorum) {
        const votableSupply = await prisma.votableSupply.findFirst({});
        return (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
      }

      return contractQuorum;
    }
  }
}

export async function getCurrentQuorum() {
  switch (DEPLOYMENT_NAME) {
    case "optimism": {
      const latestBlock = await provider.getBlock("latest");
      if (!latestBlock) {
        return null;
      }
      // latest - 1 because latest block might not be mined yet
      return OptimismContracts.governor.contract.quorum(latestBlock.number - 1);
    }
  }
}
