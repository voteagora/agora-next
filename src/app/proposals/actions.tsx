"use server";

import { fetchAllForVoting as apiFetchAllForVoting } from "@/app/api/votes/getVotes";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";

export const fetchProposalVotes = (proposal_id: string, page = 1) =>
  apiFetchVotesForProposal({
    proposal_id,
    page,
  });

export const fetchUserVotesForProposal = (
  proposal_id: string,
  address: string | `0x${string}`
) =>
  apiFetchUserVotesForProposal({
    proposal_id,
    address,
  });

export const fetchAllForVoting = (
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) => apiFetchAllForVoting(address, blockNumber, proposal_id);
