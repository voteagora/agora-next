"use server";

import {
  ProposalDraftTransaction,
  ProposalDraftApprovedSponsors,
  ProposalDraftVote,
} from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { draftProposalsSortOptions } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import {
  ProposalStage as PrismaProposalStage,
  ProposalDraft,
} from "@prisma/client";

const action = async (
  address: `0x${string}` | undefined,
  ownerOnly = false,
  sort: string
) => {
  const isNewestSort = sort === draftProposalsSortOptions.newest.sort;
  const isOldestSort = sort === draftProposalsSortOptions.oldest.sort;
  const isMostVotesSort = sort === draftProposalsSortOptions.mostVotes.sort;
  const isLeastVotesSort = sort === draftProposalsSortOptions.leastVotes.sort;

  const { contracts } = Tenant.current();

  const onlyOwnerQuery = `
    AND (p.is_public = true
    OR EXISTS (
    SELECT 1 FROM "ApprovedSponsor"
    WHERE proposal_id = p.id
    AND sponsor_address = $4
    ))
  `;

  const stage = PrismaProposalStage.AWAITING_SPONSORSHIP;
  const chainId = contracts.governor.chain.id;
  const contract = contracts.governor.address;

  const sortFilter = isNewestSort
    ? "p.created_at DESC"
    : isOldestSort
      ? "p.created_at ASC"
      : isMostVotesSort
        ? "COALESCE(SUM(v.weight * v.direction), 0) DESC"
        : "COALESCE(SUM(v.weight * v.direction), 0) ASC";

  const query = `
    SELECT p.*,
      COALESCE(SUM(v.weight * v.direction), 0) as vote_weight,
      COALESCE(json_agg(t.*) FILTER (WHERE t.id IS NOT NULL), '[]') as transactions,
      COALESCE(json_agg(s.*) FILTER (WHERE s.id IS NOT NULL), '[]') as approved_sponsors,
      COALESCE(json_agg(v.*) FILTER (WHERE v.id IS NOT NULL), '[]') as votes
    FROM alltenant.proposals p
    LEFT JOIN alltenant.proposal_votes v ON p.id = v.proposal_id
    LEFT JOIN alltenant.proposal_transactions t ON p.id = t.proposal_id
    LEFT JOIN alltenant.proposal_approved_sponsors s ON p.id = s.proposal_id
    WHERE p.stage = $1::alltenant.proposal_stage
      AND p.chain_id = $2
      AND p.contract = $3
      ${ownerOnly ? onlyOwnerQuery : ""}
      AND p.author_address = $4
    GROUP BY p.id
    ORDER BY ${sortFilter}
`;

  return prisma.$queryRawUnsafe<
    (ProposalDraft & {
      transactions: ProposalDraftTransaction[];
      approved_sponsors: ProposalDraftApprovedSponsors[];
      votes: ProposalDraftVote[];
    })[]
  >(query, String(stage), chainId, contract, address);
};

export default action;
