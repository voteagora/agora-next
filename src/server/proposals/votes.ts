/*
 * TanStack Start createServerFn wrappers for proposal vote actions.
 *
 * Each wrapper preserves the original function signature so client components
 * only need to update their import path — call sites stay unchanged.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type {
  fetchUserVotesForProposal as _OrigFetchUserVotes,
  fetchProposalVotes as _OrigFetchProposalVotes,
  fetchVotersWhoHaveNotVotedForProposal as _OrigFetchNonVoters,
  fetchSnapshotProposalVotes as _OrigFetchSnapshotProposalVotes,
} from "@/app/proposals/actions";

import type { VoterTypes } from "@/app/api/common/votes/vote";
import type { PaginationParams } from "@/app/lib/pagination";
import type { VotesSort } from "@/app/api/common/votes/vote.d";

// ─── fetchProposalsCount ──────────────────────────────────────────────────────
// (no-arg, used by admin/index.tsx loader; no original wrapper needed)

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

// ─── fetchUserVotesForProposal ────────────────────────────────────────────────

const _serverFetchUserVotesForProposal = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({ proposalId: z.string(), address: z.string() })
      .parse.bind(z.object({ proposalId: z.string(), address: z.string() }))
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchUserVotesForProposal: fn } = await import(
      "@/app/proposals/actions"
    );
    return fn(data.proposalId, data.address);
  });

export const fetchUserVotesForProposal: typeof _OrigFetchUserVotes = (
  proposalId,
  address
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverFetchUserVotesForProposal({ data: { proposalId, address } }) as any;

// ─── fetchProposalVotes ───────────────────────────────────────────────────────

const _fetchProposalVotesInput = z.object({
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

const _serverFetchProposalVotes = createServerFn({ method: "GET" })
  .inputValidator((data: z.input<typeof _fetchProposalVotesInput>) =>
    _fetchProposalVotesInput.parse(data)
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchProposalVotes: fn } = await import("@/app/proposals/actions");
    return fn(
      data.proposalId,
      data.pagination,
      data.sort as VotesSort | undefined,
      data.offchainProposalId
    );
  });

export const fetchProposalVotes: typeof _OrigFetchProposalVotes = (
  proposalId,
  pagination?,
  sort?,
  offchainProposalId?
) =>
  _serverFetchProposalVotes({
    data: { proposalId, pagination, sort, offchainProposalId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

// ─── fetchVotersWhoHaveNotVotedForProposal ────────────────────────────────────

const _fetchNonVotersInput = z.object({
  proposalId: z.string(),
  pagination: z
    .object({
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })
    .optional(),
  offchainProposalId: z.string().optional(),
  type: z.string().optional(),
});

const _serverFetchNonVoters = createServerFn({ method: "GET" })
  .inputValidator((data: z.input<typeof _fetchNonVotersInput>) =>
    _fetchNonVotersInput.parse(data)
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchVotersWhoHaveNotVotedForProposal: fn } = await import(
      "@/app/proposals/actions"
    );
    return fn(
      data.proposalId,
      data.pagination,
      data.offchainProposalId,
      data.type as VoterTypes["type"] | undefined
    );
  });

export const fetchVotersWhoHaveNotVotedForProposal: typeof _OrigFetchNonVoters =
  (proposalId, pagination?, offchainProposalId?, type?) =>
    _serverFetchNonVoters({
      data: { proposalId, pagination, offchainProposalId, type },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

// ─── fetchSnapshotProposalVotes ───────────────────────────────────────────────

const _fetchSnapshotVotesInput = z.object({
  proposalId: z.string(),
  pagination: z
    .object({
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })
    .optional(),
});

const _serverFetchSnapshotProposalVotes = createServerFn({ method: "GET" })
  .inputValidator((data: z.input<typeof _fetchSnapshotVotesInput>) =>
    _fetchSnapshotVotesInput.parse(data)
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { fetchSnapshotProposalVotes: fn } = await import(
      "@/app/proposals/actions"
    );
    return fn(data.proposalId, data.pagination);
  });

export const fetchSnapshotProposalVotes: typeof _OrigFetchSnapshotProposalVotes =
  (proposalId, pagination?) =>
    _serverFetchSnapshotProposalVotes({
      data: { proposalId, pagination },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
