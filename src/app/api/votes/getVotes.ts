import { fetchVotesForProposalAndDelegate } from "../common/votes/getVotes";
import { fetchVotingPowerForProposal } from "@/app/api/common/voting-power/getVotingPower";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchAuthorityChains } from "@/app/api/common/authority-chains/getAuthorityChains";
import { cache } from "react";

async function getAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposalId: string
) {
  const results = await Promise.allSettled([
    fetchVotingPowerForProposal({
      addressOrENSName: address,
      blockNumber,
      proposalId,
    }),
    fetchAuthorityChains({ address, blockNumber }),
    fetchDelegate(address),
    fetchVotesForProposalAndDelegate({ proposalId, address }),
  ]);

  const votingPower =
    results[0].status === "fulfilled" ? results[0].value : null;
  const authorityChains =
    results[1].status === "fulfilled" ? results[1].value : null;
  const delegate = results[2].status === "fulfilled" ? results[2].value : null;
  const votesForProposalAndDelegate =
    results[3].status === "fulfilled" ? results[3].value : null;

  return {
    votingPower,
    authorityChains,
    delegate,
    votesForProposalAndDelegate,
  };
}

export const fetchAllForVoting = cache(getAllForVoting);
