"use server";

import { fetchAllForVoting as apiFetchAllForVoting } from "@/app/api/votes/getVotes";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { PaginationParams } from "../lib/pagination";

export const fetchProposalVotes = (
  proposalId: string,
  pagination?: PaginationParams
) =>
  apiFetchVotesForProposal({
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

export const fetchAllForVoting = (
  address: string | `0x${string}`,
  blockNumber: number,
  proposalId: string
) => apiFetchAllForVoting(address, blockNumber, proposalId);
