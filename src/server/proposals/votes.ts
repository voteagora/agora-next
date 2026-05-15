/*
 * TanStack Start port of select server actions from src/app/proposals/actions.tsx.
 *
 * Pattern: multi-arg actions become server fns with a zod validator that takes
 * a single object. Call sites change from `fetchUserVotesForProposal(a, b)`
 * to `fetchUserVotesForProposal({ data: { proposalId: a, address: b } })`.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { getProposalsCount } from "@/lib/prismaUtils";
import Tenant from "@/lib/tenant/tenant";

export const fetchProposalsCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const { namespace, contracts } = Tenant.current();
    return getProposalsCount({
      namespace,
      contract: contracts.governor.address,
    });
  }
);

const fetchUserVotesInput = z.object({
  proposalId: z.string(),
  address: z.string(),
});

export const fetchUserVotesForProposal = createServerFn({ method: "GET" })
  .inputValidator((data: z.input<typeof fetchUserVotesInput>) =>
    fetchUserVotesInput.parse(data)
  )
  .handler(async ({ data }) => {
    return apiFetchUserVotesForProposal({
      proposalId: data.proposalId,
      address: data.address as `0x${string}` | string,
    });
  });

const fetchProposalVotesInput = z.object({
  proposalId: z.string(),
  pagination: z
    .object({
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })
    .optional(),
  sort: z.string().optional(),
  offchainProposalId: z.string().optional(),
});

export const fetchProposalVotes = createServerFn({ method: "GET" })
  .inputValidator((data: z.input<typeof fetchProposalVotesInput>) =>
    fetchProposalVotesInput.parse(data)
  )
  .handler(async ({ data }) => {
    return apiFetchVotesForProposal({
      proposalId: data.proposalId,
      pagination: data.pagination,
      sort: data.sort as never,
      offchainProposalId: data.offchainProposalId,
    });
  });
