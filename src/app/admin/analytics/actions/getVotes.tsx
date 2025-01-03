import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { startingBlockNumber } from "../utils";
import { ANALYTICS_EVENTS } from "@/lib/constants";

export const getVotes = async () => {
  const { namespace, contracts, slug } = Tenant.current();
  const chainId = contracts.governor.chain.id;

  const eventsQuery = `
    SELECT
    event_data->>'proposal_id' as proposal_id,
    COUNT(*) as vote_count
    FROM alltenant.analytics_events
    WHERE event_name = '${ANALYTICS_EVENTS.STANDARD_VOTE}'
    AND event_data->>'dao_slug' = '${slug}'
    AND event_data->>'contract_address' = '${contracts.governor.address.toLowerCase()}'
    GROUP BY event_data->>'proposal_id'
    ORDER BY vote_count DESC;
  `;
  const eventsStartedAtBlock =
    startingBlockNumber[chainId as keyof typeof startingBlockNumber];

  const votesQuery = `
    SELECT v.proposal_id, COUNT(*) as vote_count, p.end_block, p.description
    FROM ${namespace}.votes v
    JOIN ${namespace}.proposals_v2 p ON v.proposal_id = p.proposal_id
    WHERE CAST(p.start_block AS INTEGER) >= ${eventsStartedAtBlock}
    AND p.contract = '${contracts.governor.address.toLowerCase()}'
    GROUP BY v.proposal_id, p.end_block, p.description
    ORDER BY p.end_block DESC;
  `;

  const voteEventsByProposalId = (await prisma.$queryRawUnsafe(
    eventsQuery
  )) as { proposal_id: string; vote_count: number }[];
  const votesByProposalId = (await prisma.$queryRawUnsafe(votesQuery)) as {
    proposal_id: string;
    vote_count: number;
    end_block: number;
    description: string;
  }[];

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
