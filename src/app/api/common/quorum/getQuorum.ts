import provider from "@/app/lib/provider";
import prisma from "@/app/lib/prisma";
import { ProposalPayload } from "../proposals/proposal";
import Tenant from "@/lib/tenant/tenant";

export async function getQuorumForProposal(proposal: ProposalPayload) {
  const { namespace, contracts } = Tenant.getInstance();

  switch (namespace) {
    case "optimism": {
      const contractQuorum = contracts.governor.contract.quorum(
        proposal.proposal_id
      );

      // If no quorum is set, calculate it based on votable supply
      if (!contractQuorum) {
        const votableSupply = await prisma[
          `${namespace}VotableSupply`
        ].findFirst({});
        return (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
      }

      return contractQuorum;
    }
  }
}

export async function getCurrentQuorum() {
  const { namespace, contracts } = Tenant.getInstance();

  switch (namespace) {
    case "optimism": {
      const latestBlock = await provider.getBlockNumber();
      if (!latestBlock) {
        return null;
      }
      // latest - 1 because latest block might not be mined yet
      return contracts.governor.contract.quorum(latestBlock - 1);
    }
  }
}
