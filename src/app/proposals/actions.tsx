"use server";

import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
  fetchVotersWhoHaveNotVotedForProposal as apiFetchVotersWhoHaveNotVotedForProposal,
  fetchSnapshotVotesForProposal as apiFetchSnapshotVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { getProposalsCount } from "@/lib/prismaUtils";
import { PaginationParams } from "../lib/pagination";
import { VoterTypes, VotesSort } from "../api/common/votes/vote";
import Tenant from "@/lib/tenant/tenant";

export async function fetchProposalsCount() {
  const { namespace, contracts } = Tenant.current();
  return getProposalsCount({
    namespace,
    contract: contracts.governor.address,
  });
}

export async function fetchVotersWhoHaveNotVotedForProposal(
  proposalId: string,
  pagination?: PaginationParams,
  offchainProposalId?: string,
  type?: VoterTypes["type"]
) {
  return apiFetchVotersWhoHaveNotVotedForProposal({
    proposalId,
    pagination,
    offchainProposalId,
    type,
  });
}

export async function fetchProposalVotes(
  proposalId: string,
  pagination?: PaginationParams,
  sort?: VotesSort,
  offchainProposalId?: string
) {
  return apiFetchVotesForProposal({
    proposalId,
    pagination,
    sort,
    offchainProposalId,
  });
}

export async function fetchSnapshotProposalVotes(
  proposalId: string,
  pagination?: PaginationParams
) {
  return apiFetchSnapshotVotesForProposal({
    proposalId,
    pagination,
  });
}

export async function fetchUserVotesForProposal(
  proposalId: string,
  address: string | `0x${string}`
) {
  return apiFetchUserVotesForProposal({
    proposalId,
    address,
  });
}
