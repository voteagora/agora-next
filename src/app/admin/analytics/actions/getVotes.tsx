import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export const getVotes = async () => {
  const { namespace } = Tenant.current();

  const eventsQuery = `
    SELECT
    event_data->>'proposal_id' as proposal_id,
    COUNT(*) as vote_count
    FROM alltenant.analytics_events
    WHERE event_name = 'Standard Vote'
    GROUP BY event_data->>'proposal_id'
    ORDER BY vote_count DESC;
  `;

  const votesQuery = `
    SELECT v.proposal_id, COUNT(*) as vote_count, p.end_block
    FROM ${namespace}.votes v
    JOIN ${namespace}.proposals_v2 p ON v.proposal_id = p.proposal_id
    GROUP BY v.proposal_id, p.end_block
    ORDER BY p.end_block DESC;
  `;

  const voteEventsByProposalId = (await prisma.$queryRawUnsafe(
    eventsQuery
  )) as { proposal_id: string; vote_count: number }[];
  const votesByProposalId = (await prisma.$queryRawUnsafe(votesQuery)) as {
    proposal_id: string;
    vote_count: number;
  }[];

  // zip by proposal_id

  const zipped = votesByProposalId.map((vote) => {
    const event = voteEventsByProposalId.find(
      (event) => event.proposal_id === vote.proposal_id
    );
    return {
      proposal_id: vote.proposal_id,
      vote_count: vote.vote_count,
      event_count: event?.vote_count || 0,
    };
  });

  return zipped;
};
