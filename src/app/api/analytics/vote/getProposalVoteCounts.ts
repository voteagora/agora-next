import Tenant from "@/lib/tenant/tenant";
import prisma from "@/app/lib/prisma";
import { cache } from "react";

type ProposalCount = {
  position: number;
  proposalId: number;
  voter_count: number;
  proposal_title: string;
};

async function getProposalVoteCounts() {
  const { slug, contracts } = Tenant.current();

  const govContract = contracts.governor.address;

  const QRY = `WITH 
                proposal_counts AS
                (
                        SELECT   proposal_id,
                                  Sum(voter_count) voter_count
                        FROM     alltenant.dao_engagement_votes_cs
                        WHERE    dao_slug = '${slug}'
                        AND      contract = '${govContract}'
                        GROUP BY 1
                        ORDER BY 1), 

                relevant_proposals AS
                (
                      SELECT *
                      FROM   uniswap.proposals
                      WHERE  contract = '${govContract}')

                SELECT    ROW_NUMBER() OVER (ORDER BY p.start_block) AS position,
                          pc.proposal_id, 
                          pc.voter_count,
                          split_part(p.description, e'\n', 1)
                FROM      proposal_counts pc left join relevant_proposals p 
                ON        pc.proposal_id::text = p.proposal_id 
                ORDER BY  p.start_block`;

  const result = await prisma.$queryRawUnsafe<ProposalCount[]>(QRY);

  return { result };
}
export const apiFetchProposalVoteCounts = cache(getProposalVoteCounts);
