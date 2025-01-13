"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ANALYTICS_EVENTS } from "@/lib/constants";
import { getSecondsPerBlock } from "@/lib/blockTimes";

export const getVotes = async ({ range = 60 * 60 * 24 }: { range: number }) => {
  const { namespace, contracts, slug } = Tenant.current();
  const chainId = contracts.governor.chain.id;

  const secondsPerBlock = getSecondsPerBlock();
  const rangeInBlocks = Math.floor(range / secondsPerBlock);
  const currentBlockNumber = await contracts.token.provider.getBlockNumber();

  const eventsQuery = `
    SELECT
    event_data->>'proposal_id' as proposal_id,
    COUNT(*) as vote_count
    FROM alltenant.analytics_events
    WHERE event_name = '${ANALYTICS_EVENTS.STANDARD_VOTE}'
    AND event_data->>'dao_slug' = '${slug}'
    AND event_data->>'governor_address' = '${contracts.governor.address.toLowerCase()}'
    GROUP BY event_data->>'proposal_id'
    ORDER BY vote_count DESC;
  `;

  // @dev
  // The "votes" table was pretty much unusable here due to how slow it is.
  // I'm guessing it's doing a crazy amount of joins or something.
  // Opting for "vote_cast_events" instead, which feels a bit lower level but should
  // serve our need as long as there is 1 record per vote.
  // Even still, this query is slow (~30s to load votes going back 1 week's worth of time on OP)
  const votesQuery = `
    WITH filtered_proposals AS (
      SELECT proposal_id, end_block, description
      FROM ${namespace}.proposals_v2
      WHERE CAST(start_block AS INTEGER) >= ${currentBlockNumber - rangeInBlocks}
       AND contract = '${contracts.governor.address.toLowerCase()}'
    )
    SELECT
      v.proposal_id,
      COUNT(*) as vote_count,
      p.end_block,
      p.description
    FROM ${namespace}.vote_cast_events v
    JOIN filtered_proposals p ON v.proposal_id = p.proposal_id
    GROUP BY v.proposal_id, p.end_block, p.description
    ORDER BY p.end_block DESC;
  `;

  const start = performance.now();

  const [voteEventsByProposalId, votesByProposalId] = await Promise.all([
    prisma.$queryRawUnsafe(eventsQuery) as Promise<
      { proposal_id: string; vote_count: number }[]
    >,
    prisma.$queryRawUnsafe(votesQuery) as Promise<
      {
        proposal_id: string;
        vote_count: number;
        end_block: number;
        description: string;
      }[]
    >,
  ]);

  const end = performance.now();
  console.log(`Total query execution time: ${end - start} milliseconds`);

  const zipped = votesByProposalId.map((vote) => {
    const event = voteEventsByProposalId.find(
      (event) => event.proposal_id === vote.proposal_id
    );
    return {
      proposal_id: vote.proposal_id,
      vote_count: vote.vote_count,
      event_count: event?.vote_count || 0,
      votes_on_agora: event?.vote_count || 0,
      votes_elsewhere:
        Number(vote.vote_count) - (Number(event?.vote_count) || 0),
      name: vote.description.split("\n\n")[0],
    };
  });

  return zipped;
};
