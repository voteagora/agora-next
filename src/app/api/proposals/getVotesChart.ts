import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { SnapshotVotePayload, VotePayload } from "@/app/api/common/votes/vote";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { getVotesForProposalFromDaoNode } from "@/app/lib/dao-node/client";

export async function getVotesChart({
  proposalId,
}: {
  proposalId: string;
}): Promise<any[]> {
  const { namespace, contracts, ui } = Tenant.current();

  // ✅ Check if DAO-Node is enabled for votes chart
  const isDaoNodeEnabled = ui.toggle("dao-node/votes-chart")?.enabled;

  if (isDaoNodeEnabled) {
    try {
      console.log(
        `🚀 Fetching votes chart for proposal ${proposalId} from DAO-Node...`
      );

      const daoNodeVotes = await getVotesForProposalFromDaoNode(proposalId);

      if (daoNodeVotes && Array.isArray(daoNodeVotes)) {
        console.log(
          `✅ Successfully fetched ${daoNodeVotes.length} votes from DAO-Node for chart`
        );

        // ✅ Transform DAO-Node votes to chart format
        const chartData = daoNodeVotes.map((vote: any) => ({
          voter: vote.voter_address || vote.voter,
          support: vote.support,
          weight: vote.voting_power || vote.weight || "0",
          block_number: vote.block_number || 0,
        }));

        // Group by voter and support, sum weights
        const grouped = chartData.reduce((acc: any, vote: any) => {
          const key = `${vote.voter}-${vote.support}`;
          if (!acc[key]) {
            acc[key] = {
              voter: vote.voter,
              support: vote.support,
              weight: 0,
              block_number: vote.block_number,
            };
          }
          acc[key].weight += parseFloat(vote.weight.toString());
          acc[key].block_number = Math.max(
            acc[key].block_number,
            vote.block_number
          );
          return acc;
        }, {});

        return Object.values(grouped);
      }
    } catch (error) {
      console.warn(
        `⚠️ DAO-Node votes chart failed for proposal ${proposalId}, falling back to DB:`,
        error
      );
    }
  }

  // ✅ For Shape, avoid DB fallback if DAO-Node is enabled (tables don't exist)
  if (isDaoNodeEnabled) {
    console.warn(
      `⚠️ DAO-Node failed for ${proposalId}, but avoiding DB fallback for ${namespace} (tables missing)`
    );
    return []; // Return empty array instead of crashing
  }

  // Traditional DB query for other tenants
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
