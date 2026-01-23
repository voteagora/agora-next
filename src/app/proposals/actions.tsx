"use server";

import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchUserVoteStatus as apiFetchUserVoteStatus,
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

import { Proposal } from "../api/common/proposals/proposal";

export const fetchUserVotesForProposal = (
  proposalId: string,
  address: string | `0x${string}`,
  proposal?: Proposal
) =>
  apiFetchUserVotesForProposal({
    proposalId,
    address,
    proposal,
  });

export const fetchUserVoteStatus = (
  proposalId: string,
  address: string | `0x${string}`,
  proposal?: Proposal
) =>
  apiFetchUserVoteStatus({
    proposalId,
    address,
    proposal,
  });
