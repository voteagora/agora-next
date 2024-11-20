"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalDraft } from "@prisma/client";
import { paginateResult, PaginationParams } from "@/app/lib/pagination";
import { doInSpan } from "@/app/lib/logging";
import { myDraftsSortOptions } from "@/lib/constants";

const action = async (
  address: `0x${string}` | undefined,
  sort: string,
  pagination: PaginationParams
) => {
  const { contracts } = Tenant.current();
  const chainId = contracts.governor.chain.id;
  const contract = contracts.governor.address;
  const isNewestSort = sort === myDraftsSortOptions.newest.sort;
  const isOldestSort = sort === myDraftsSortOptions.oldest.sort;
  const sortFilter = isNewestSort
    ? "p.created_at DESC"
    : isOldestSort
      ? "p.created_at ASC"
      : "";

  const query = `
SELECT
    p.*
    FROM alltenant.proposals p
     WHERE p.stage NOT IN (
      'PENDING'::alltenant.proposal_stage,
      'AWAITING_SPONSORSHIP'::alltenant.proposal_stage,
      'QUEUED'::alltenant.proposal_stage,
      'EXECUTED'::alltenant.proposal_stage,
      'CANCELED'::alltenant.proposal_stage
    )
    AND p.author_address = $1
    AND p.chain_id = $2
    AND p.contract = $3
    ORDER BY ${sortFilter}
    OFFSET $4
    LIMIT $5
`;

  const rawQuery = async (skip: number, take: number) =>
    prisma.$queryRawUnsafe<ProposalDraft[]>(
      query,
      address,
      chainId,
      contract,
      skip,
      take
    );

  const getMyDraftProposalsExecution = doInSpan(
    { name: "getMyDraftProposals" },
    async () => paginateResult(rawQuery, pagination)
  );

  const myDraftProposals = await getMyDraftProposalsExecution;

  return {
    meta: myDraftProposals.meta,
    data: myDraftProposals.data,
  };
};

export default action;
