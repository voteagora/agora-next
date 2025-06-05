import { parseProposal } from "@/lib/proposalUtils";
import { cache } from "react";
import { prismaWeb3Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalPayload } from "./proposal";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import { Block } from "ethers";
import { withMetrics } from "@/lib/metricWrapper";
import { fetchProposals } from "./getProposals";
import { getVotesForDelegateFromDaoNode } from "@/app/lib/dao-node/client";

async function getNeedsMyVoteProposals(address: string) {
  return withMetrics("getNeedsMyVoteProposals", async () => {
    const { namespace, contracts, ui } = Tenant.current();

    const isTimeStampBasedTenant = ui.toggle(
      "use-timestamp-for-proposals"
    )?.enabled;

    const latestBlockPromise: Promise<Block> = ui.toggle("use-l1-block-number")
      ?.enabled
      ? contracts.providerForTime?.getBlock("latest")
      : contracts.token.provider.getBlock("latest");

    const useDaoNode =
      ui.toggle("use-daonode-for-get-needs-my-vote-proposals")?.enabled ??
      false;

    const [latestBlock, votableSupply] = await Promise.all([
      latestBlockPromise,
      fetchVotableSupply(),
    ]);

    if (!latestBlock) {
      throw new Error("Could not get latest block");
    }

    if (useDaoNode) {
      const [proposals, votes] = await Promise.all([
        await fetchProposals({
          filter: "relevant",
          pagination: {
            limit: 10,
            offset: 0,
          },
        }),
        getVotesForDelegateFromDaoNode(address),
      ]);

      const proposalsWithoutVotes = proposals.data.filter((proposal) => {
        const vote = votes.find(
          (vote: any) => vote.proposal_id === proposal.id
        );
        return !vote;
      });
      return {
        proposals: proposalsWithoutVotes,
      };
    }

    const prodDataOnly =
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod" ? `AND contract = $3` : "";

    const proposals = await prismaWeb3Client.$queryRawUnsafe<ProposalPayload[]>(
      `
        SELECT p.*
        FROM (
          SELECT *
          FROM ${namespace + ".proposals_v2"}
          WHERE ${
            isTimeStampBasedTenant
              ? `CAST(start_timestamp AS INTEGER) < $1
                 AND CAST(end_timestamp AS INTEGER) > $1`
              : `CAST(start_block AS INTEGER) < $1
                 AND CAST(end_block AS INTEGER) > $1`
          }
            AND cancelled_block IS NULL
            ${prodDataOnly}
        ) AS p
        LEFT JOIN ${
          namespace + ".votes"
        } v ON p.proposal_id = v.proposal_id AND v.voter = $2
        WHERE v.proposal_id IS NULL
        ORDER BY p.ordinal DESC;
        `,
      isTimeStampBasedTenant ? latestBlock.timestamp : latestBlock.number,
      address.toLowerCase(),
      contracts.governor.address
    );

    const resolvedProposals = Promise.all(
      proposals.map(async (proposal) => {
        const quorum = await fetchQuorumForProposal(proposal);
        return parseProposal(
          proposal,
          latestBlock,
          quorum ?? null,
          BigInt(votableSupply)
        );
      })
    );

    return {
      proposals: await resolvedProposals,
    };
  });
}

export const fetchNeedsMyVoteProposals = cache(getNeedsMyVoteProposals);
