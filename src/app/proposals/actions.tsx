"use server";

import { fetchAllForVoting as apiFetchAllForVoting } from "@/app/api/votes/getVotes";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
  fetchVotersWhoHaveNotVotedForProposal as apiFetchVotersWhoHaveNotVotedForProposal,
} from "@/app/api/common/votes/getVotes";
import { PaginationParams } from "../lib/pagination";
import { VotesSort } from "../api/common/votes/vote";

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

export const fetchAllForVoting = (
  address: string | `0x${string}`,
  blockNumber: number,
  proposalId: string
) => apiFetchAllForVoting(address, blockNumber, proposalId);
