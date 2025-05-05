import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { SnapshotVotePayload, VotePayload } from "@/app/api/common/votes/vote";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { getProposalFromDaoNode } from "@/app/lib/dao-node/client";

export async function getVotesChart({
  proposalId,
}: {
  proposalId: string;
}): Promise<any[]> {
  const { namespace, contracts, ui } = Tenant.current();
  const useDaoNode = ui.toggle("dao-node/votes-chart")?.enabled ?? false;
  if (useDaoNode) {
    try {
      const proposal = (await getProposalFromDaoNode(proposalId)).proposal;
      if (!proposal) {
        // Will be caught and ignored below and move on to DB fallback
        throw new Error("Proposal not found");
      }
      const votes = proposal.voting_record?.map((vote) => {
        return {
          voter: vote.voter,
          support: String(vote.support),
          weight: vote.votes.toString(),
          block_number: String(vote.block_number),
        };
      });
      return votes;
    } catch (error) {
      // skip error
    }
  }

  let eventsViewName;

  if (namespace == TENANT_NAMESPACES.OPTIMISM) {
    eventsViewName = "vote_cast_with_params_events_v2";
  } else {
    eventsViewName = "vote_cast_with_params_events";
  }

  const query = `
    SELECT
      voter,
      support,
      SUM(weight) as weight,
      MAX(block_number) as block_number
    FROM (
      SELECT
        voter,
        support,
        weight::numeric,
        block_number
      FROM ${namespace}.vote_cast_events
      WHERE proposal_id = $1 AND contract = $2
      UNION ALL
      SELECT
        voter,
        support,
        weight::numeric,
        block_number
      FROM ${namespace}.${eventsViewName}
      WHERE proposal_id = $1 AND contract = $2
    ) t
    GROUP BY voter, support
    ORDER BY block_number ASC;
  `;

  return await prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
    query,
    proposalId,
    contracts.governor.address.toLowerCase()
  );
}

export async function getSnapshotVotesChart({
  proposalId,
}: {
  proposalId: string;
}): Promise<any[]> {
  const { slug } = Tenant.current();

  const query = `
    SELECT
      voter,
      created,
      vp
    FROM "snapshot".votes
    WHERE proposal_id = $1 AND dao_slug = '${slug}'
    ORDER BY created ASC;
  `;

  const data = await prismaWeb3Client.$queryRawUnsafe<SnapshotVotePayload[]>(
    query,
    proposalId,
    slug
  );

  return data.map((vote) => ({
    ...vote,
    weight: Number(vote.vp),
    support: "1",
  }));
}
