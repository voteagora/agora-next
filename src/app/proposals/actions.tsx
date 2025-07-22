"use server";

import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
  fetchVotersWhoHaveNotVotedForProposal as apiFetchVotersWhoHaveNotVotedForProposal,
  fetchSnapshotVotesForProposal as apiFetchSnapshotVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { getProposalsCount } from "@/lib/prismaUtils";
import { PaginationParams } from "../lib/pagination";
import { VotesSort } from "../api/common/votes/vote";
import Tenant from "@/lib/tenant/tenant";
import { VoterTypes } from "@/components/Votes/ProposalVotesList/ProsalVoterListFilter";

export async function fetchProposalsCount() {
  const { namespace, contracts } = Tenant.current();
  return getProposalsCount({
    namespace,
    contract: contracts.governor.address,
  });
}

export const fetchVotersWhoHaveNotVotedForProposal = (
  proposalId: string,
  pagination?: PaginationParams,
  offchainProposalId?: string,
  type?: VoterTypes["type"]
) =>
  apiFetchVotersWhoHaveNotVotedForProposal({
    proposalId,
    pagination,
    offchainProposalId,
    type,
  });

export const fetchProposalVotes = (
  proposalId: string,
  pagination?: PaginationParams,
  sort?: VotesSort,
  offchainProposalId?: string
) =>
  apiFetchVotesForProposal({
    proposalId,
    pagination,
    sort,
    offchainProposalId,
  });

export const fetchSnapshotProposalVotes = (
  proposalId: string,
  pagination?: PaginationParams
) =>
  apiFetchSnapshotVotesForProposal({
    proposalId,
    pagination,
  });

export const fetchUserVotesForProposal = (
  proposalId: string,
  address: string | `0x${string}`
) =>
  apiFetchUserVotesForProposal({
    proposalId,
    address,
  });
