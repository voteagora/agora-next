"use server";

import { getAllForVoting } from "@/app/api/votes/getVotes";
import {
  getUserVotesForProposal,
  getVotesForProposal,
} from "@/app/api/common/votes/getVotes";

export const fetchProposalVotes = (proposal_id: string, page = 1) =>
  getVotesForProposal({
    proposal_id,
    page,
  });

export const fetchUserVotesForProposal = (
  proposal_id: string,
  address: string | `0x${string}`
) =>
  getUserVotesForProposal({
    proposal_id,
    address,
  });

export const fetchAllForVoting = (
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) => getAllForVoting(address, blockNumber, proposal_id);
