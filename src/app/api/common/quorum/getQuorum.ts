import { cache } from "react";
import provider from "@/app/lib/provider";
import prisma from "@/app/lib/prisma";
import { ProposalPayload } from "../proposals/proposal";
import Tenant from "@/lib/tenant/tenant";

/*
  Retrieve quorum from the governor contract for the supplied proposal,
  calculating it if not specified

  @dev: only supports optimisim
*/
async function getQuorumForProposal(proposal: ProposalPayload) {
  const { namespace, contracts } = Tenant.current();

  switch (namespace) {
    case "optimism": {
      const contractQuorum = await contracts.governor.contract.quorum(
        proposal.proposal_id,
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

/*
  Retrieve the current quorum based on block number
*/
async function getCurrentQuorum() {
  const { namespace, contracts } = Tenant.current();

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

/*
  Gets and caches the quorum for the supplied proposal
*/
export const fetchQuorumForProposal = cache(getQuorumForProposal);

/*
  Gets and caches quorum based on current block number
*/
export const fetchCurrentQuorum = cache(getCurrentQuorum);
