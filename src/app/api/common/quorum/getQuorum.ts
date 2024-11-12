import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { ProposalPayload } from "../proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { findVotableSupply } from "@/lib/prismaUtils";

async function getQuorumForProposal(proposal: ProposalPayload) {
  const { namespace, contracts } = Tenant.current();

  var votableSupply;
  var quorum;

  switch (namespace) {
    case TENANT_NAMESPACES.ENS:
      if (proposal.created_block) {
        return await contracts.governor.contract.quorum!(
          proposal.created_block
        );
      } else {
        return null;
      }

    case TENANT_NAMESPACES.UNISWAP:
      return await contracts.governor.contract.quorumVotes!();

    case TENANT_NAMESPACES.OPTIMISM:
      quorum = await contracts.governor.contract.quorum!(proposal.proposal_id);

      // If no quorum is set, calculate it based on votable supply
      if (!quorum) {
        votableSupply = await findVotableSupply({ namespace });
        return (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
      }
      return quorum;

    case TENANT_NAMESPACES.CYBER:
      // Why is the cyber implementation hardcoded to 30%? Rather than checking based on every proposal?

      // Because...
      // https://voteagora.slack.com/archives/C07ATDL9P8F/p1723657375357649?thread_ts=1723579392.179389&cid=C07ATDL9P8F
      // https://voteagora.slack.com/archives/C07ATDL9P8F/p1723657834565499

      votableSupply = await findVotableSupply({ namespace });
      return (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;

    default: // TENANT_NAMESPACES.PGUILD - yes, TENANT_NAMESPACES.SCROLL?
      try {
        quorum = await contracts.governor.contract.quorum!(
          proposal.proposal_id
        );
      } catch {
        // this is a hack, because... // https://linear.app/agora-app/issue/AGORA-3246/quorum-isnt-known-for-proposal-before-its-snapshot
        quorum = await findVotableSupply({ namespace });
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
