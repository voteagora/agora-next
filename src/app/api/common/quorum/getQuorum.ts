import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { ProposalPayload } from "../proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

async function getQuorumForProposal(proposal: ProposalPayload) {
  const { namespace, contracts } = Tenant.current();

  // TODO: Andrei - Refactor this using tenant's governor contract type rather than namespace
  switch (namespace) {
    case TENANT_NAMESPACES.UNISWAP:
      return await contracts.governor.contract.quorumVotes!();

    case TENANT_NAMESPACES.OPTIMISM:
      const quorum = await contracts.governor.contract.quorum!(
        proposal.proposal_id
      );

      // If no quorum is set, calculate it based on votable supply
      if (!quorum) {
        const votableSupply = await prisma[
          `${namespace}VotableSupply`
        ].findFirst({});
        return (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
      }
      return quorum;
  }
}

/*
  Retrieve the current quorum based on block number
*/
async function getCurrentQuorum() {
  const { namespace, contracts } = Tenant.current();

  switch (namespace) {
    case TENANT_NAMESPACES.UNISWAP:
      return contracts.governor.contract.quorumVotes!();

    case TENANT_NAMESPACES.OPTIMISM: {
      const latestBlockNumber = await contracts.token.provider.getBlockNumber();
      if (!latestBlockNumber) {
        return null;
      }
      // latest - 1 because latest block might not be mined yet
      return contracts.governor.contract.quorum!(latestBlockNumber - 1);
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
