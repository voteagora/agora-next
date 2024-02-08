"use server";

import {
  getVotesForProposal,
  getUserVotesForProposal,
  getAllForVoting,
} from "@/app/api/votes/getVotes";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { getDelegateStatement } from "@/app/api/delegateStatement/getDelegateStatement";
import {
  getAllDelegatorsInChainsForAddress,
  getCurrentDelegators,
} from "@/app/api/delegations/getDelegations";
import { getVotableSupply } from "@/app/api/votableSupply/getVotableSupply";

export const fetchProposalVotes = (proposal_id: string, page = 1) =>
  getVotesForProposal({ proposal_id, page });

export const fetchDelegate = (addressOrENSName: string | `0x${string}`) =>
  getDelegate({
    addressOrENSName,
  });

export const fetchDelegateStatement = (
  addressOrENSName: string | `0x${string}`
) =>
  getDelegateStatement({
    addressOrENSName,
  });

export const fetchUserVotesForProposal = (
  proposal_id: string,
  address: string | `0x${string}`
) =>
  getUserVotesForProposal({
    proposal_id,
    address,
  });

export const fetchDelegators = (addressOrENSName: string | `0x${string}`) =>
  getCurrentDelegators({ addressOrENSName });

export const fetchAllForVoting = (
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) => getAllForVoting(address, blockNumber, proposal_id);

export const fetchVotableSupply = () => getVotableSupply();

// Pass address of the connected wallet
export async function fetchAllDelegatorsInChainsForAddress(
  addressOrENSName: string
) {
  return getAllDelegatorsInChainsForAddress({ addressOrENSName });
}
