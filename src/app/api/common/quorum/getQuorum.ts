import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { ProposalPayload } from "../proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { findVotableSupply } from "@/lib/prismaUtils";

async function getQuorumForProposal(proposal: ProposalPayload) {
  const { namespace, contracts } = Tenant.current();
  let quorum: bigint | string = BigInt(0);

  switch (namespace) {
    case TENANT_NAMESPACES.SCROLL:
    case TENANT_NAMESPACES.XAI:
      // Return zero for quorum calculation
      return BigInt(0);

    default:
      try {
        quorum = "0";
        // // Return zero or fetch from votable supply
        // quorum = await findVotableSupply({
        //   namespace,
        //   address: contracts.token.address,
        // });
      } catch {
        quorum = "0";
      }
      return BigInt(Number(quorum));
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

    case TENANT_NAMESPACES.ENS:
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
