import Tenant from "@/lib/tenant/tenant";
import { prismaWeb3Client } from "@/app/lib/web3";
import { cache } from "react";

type ProposalCount = {
  position: number;
  proposalId: number;
  voter_count: number;
  proposal_title: string;
};

async function getProposalVoteCounts() {
  const { slug, contracts, ui } = Tenant.current();

  const isTimeStampBasedTenant = ui.toggle("timestamp-for-proposals")?.enabled;

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
                      FROM   uniswap.proposals_v2
                      WHERE  contract = '${govContract}')

                SELECT    ROW_NUMBER() OVER (ORDER BY ${isTimeStampBasedTenant ? "p.start_timestamp" : "p.start_block"}) AS position,
                          pc.proposal_id, 
                          pc.voter_count,
                          split_part(p.description, e'\n', 1)
                FROM      proposal_counts pc left join relevant_proposals p 
                ON        pc.proposal_id::text = p.proposal_id 
                ORDER BY  ${isTimeStampBasedTenant ? "p.start_timestamp" : "p.start_block"}`;

  const result = (await prismaWeb3Client.$queryRawUnsafe(
    QRY
  )) as ProposalCount[];

  return { result };
}
export const apiFetchProposalVoteCounts = cache(getProposalVoteCounts);
