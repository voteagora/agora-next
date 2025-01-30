"use server";

import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
  fetchVotersWhoHaveNotVotedForProposal as apiFetchVotersWhoHaveNotVotedForProposal,
} from "@/app/api/common/votes/getVotes";
import { getProposalsCount } from "@/lib/prismaUtils";
import { PaginationParams } from "../lib/pagination";
import { VotesSort } from "../api/common/votes/vote";
import Tenant from "@/lib/tenant/tenant";

export async function fetchProposalsCount() {
  const { namespace, contracts } = Tenant.current();
  return getProposalsCount({
    namespace,
    contract: contracts.governor.address,
  });
}

export const fetchVotersWhoHaveNotVotedForProposal = (
  proposalId: string,
  pagination?: PaginationParams
) => apiFetchVotersWhoHaveNotVotedForProposal({ proposalId, pagination });

export const fetchProposalVotes = (
  proposalId: string,
  pagination?: PaginationParams,
  sort?: VotesSort
) =>
  apiFetchVotesForProposal({
    proposalId,
    pagination,
    sort,
  });

export const fetchUserVotesForProposal = (
  proposalId: string,
  address: string | `0x${string}`
) =>
  apiFetchUserVotesForProposal({
    proposalId,
    address,
  });
