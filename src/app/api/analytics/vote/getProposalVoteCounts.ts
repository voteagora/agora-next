import Tenant from "@/lib/tenant/tenant";
import prisma from "@/app/lib/prisma";
import { cache } from "react";

type ProposalCount = {
  proposalId: number;
  votes: number;
};

async function getProposalVoteCounts() {
  const { namespace } = Tenant.current();

  const QRY = `SELECT proposal_id,
                    SUM(vote_count) votes
                FROM   alltenant.dao_engagement_votes
                WHERE  tenant = '${namespace}'
                    GROUP  BY 1
                    ORDER  BY 1`;

  const result = await prisma.$queryRawUnsafe<ProposalCount[]>(QRY);

  return { result };
}

export const apiFetchProposalVoteCounts = cache(getProposalVoteCounts);
