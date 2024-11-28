"use server";

import {
  ProposalDraftTransaction,
  ProposalDraftApprovedSponsors,
  ProposalDraftVote,
} from "@prisma/client";
import prisma from "@/app/lib/prisma";
import {
  draftProposalsFilterOptions,
  draftProposalsSortOptions,
} from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import {
  ProposalStage as PrismaProposalStage,
  ProposalDraft,
} from "@prisma/client";
import { paginateResult, PaginationParams } from "@/app/lib/pagination";
import { doInSpan } from "@/app/lib/logging";

const action = async (
  address: `0x${string}` | undefined,
  filter: string,
  sort: string,
  pagination: PaginationParams
) => {
  const ownerOnly = filter === draftProposalsFilterOptions.myDrafts.filter;
  const requestsYou = filter === draftProposalsFilterOptions.requestsYou.filter;
  const isNewestSort = sort === draftProposalsSortOptions.newest.sort;
  const isOldestSort = sort === draftProposalsSortOptions.oldest.sort;
  const isMostVotesSort = sort === draftProposalsSortOptions.mostVotes.sort;
  const isLeastVotesSort = sort === draftProposalsSortOptions.leastVotes.sort;

  const { contracts } = Tenant.current();

  // All drafts shows:
  // 1. Public drafts
  // 2. Drafts that the user has been approved as a sponsor for
  // 3. Drafts that the user is the author of
  // ---
  // My drafts shows:
  // 1. Drafts that the user is the author of
  const anyAuthorQuery = `
    AND (p.is_public = true
    OR EXISTS (
      SELECT 1 FROM alltenant.proposal_approved_sponsors
      WHERE proposal_id = p.id
      AND sponsor_address = $4
    )
    OR p.author_address = $4
    )
  `;

  const onlyOwnerQuery = `
    AND p.author_address = $4
  `;

  const requestsYouQuery = `
    AND EXISTS (
      SELECT 1 FROM alltenant.proposal_approved_sponsors
      WHERE proposal_id = p.id
      AND sponsor_address = $4
    )
  `;

  const stage = PrismaProposalStage.AWAITING_SPONSORSHIP;
  const chainId = contracts.governor.chain.id;
  const contract = contracts.governor.address;

  const sortFilter = isNewestSort
    ? "p.created_at DESC"
    : isOldestSort
      ? "p.created_at ASC"
      : isMostVotesSort
        ? "vote_weight DESC"
        : "vote_weight ASC";

  // TODO: make sure the only owner stuff is correct
  const query = `
WITH vote_weights AS (
    SELECT
        proposal_id,
        COALESCE(SUM(weight * direction), 0) as vote_weight,
        json_agg(json_build_object(
            'id', id,
            'proposal_id', proposal_id,
            'voter', voter,
            'weight', weight,
            'direction', direction,
            'created_at', created_at,
            'updated_at', updated_at
        )) as votes
    FROM alltenant.proposal_votes
    GROUP BY proposal_id
),
sponsors AS (
    SELECT
        proposal_id,
        json_agg(json_build_object(
            'id', id,
            'proposal_id', proposal_id,
            'sponsor_address', sponsor_address,
            'status', status,
            'created_at', created_at,
            'updated_at', updated_at
        )) as approved_sponsors
    FROM alltenant.proposal_approved_sponsors
    GROUP BY proposal_id
),
transactions AS (
    SELECT
        proposal_id,
        json_agg(json_build_object(
            'id', id,
            'proposal_id', proposal_id,
            'proposal_approval_option_id', proposal_approval_option_id,
            'order', "order",
            'target', target,
            'value', value,
            'calldata', calldata,
            'description', description,
            'simulation_state', simulation_state,
            'simulation_id', simulation_id,
            'created_at', created_at,
            'updated_at', updated_at
        ) ORDER BY "order") as transactions
    FROM alltenant.proposal_transactions
    GROUP BY proposal_id
)
SELECT
    p.*,
    COALESCE(v.vote_weight, 0) as vote_weight,
    COALESCE(v.votes, '[]') as votes,
    COALESCE(s.approved_sponsors, '[]') as approved_sponsors,
    COALESCE(t.transactions, '[]') as transactions
    FROM alltenant.proposals p
    LEFT JOIN vote_weights v ON p.id = v.proposal_id
    LEFT JOIN sponsors s ON p.id = s.proposal_id
    LEFT JOIN transactions t ON p.id = t.proposal_id
    WHERE p.stage = $1::alltenant.proposal_stage
      AND p.chain_id = $2
      AND p.contract = $3
      ${ownerOnly ? onlyOwnerQuery : anyAuthorQuery}
      ${requestsYou ? requestsYouQuery : ""}
    ORDER BY ${sortFilter}
    OFFSET $5
    LIMIT $6
`;

  const rawQuery = async (skip: number, take: number) =>
    prisma.$queryRawUnsafe<
      (ProposalDraft & {
        transactions: ProposalDraftTransaction[];
        approved_sponsors: ProposalDraftApprovedSponsors[];
        votes: ProposalDraftVote[];
        vote_weight: number;
      })[]
    >(query, String(stage), chainId, contract, address, skip, take);

  const getDraftProposalsExecution = doInSpan(
    { name: "getDraftProposals" },
    async () => paginateResult(rawQuery, pagination)
  );

  const draftProposals = await getDraftProposalsExecution;

  return {
    meta: draftProposals.meta,
    data: draftProposals.data,
  };
};

export default action;
