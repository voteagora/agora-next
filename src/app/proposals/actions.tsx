"use server";

import { fetchAllForVoting as apiFetchAllForVoting } from "@/app/api/votes/getVotes";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";

export const fetchProposalVotes = (
  proposalId: string,
  pagination?: { limit: number; offset: number }
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
