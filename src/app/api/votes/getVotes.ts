import { fetchVotesForProposalAndDelegate } from "../common/votes/getVotes";
import { fetchVotingPowerForProposal } from "@/app/api/common/voting-power/getVotingPower";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchAuthorityChains } from "@/app/api/common/authority-chains/getAuthorityChains";
import { cache } from "react";

async function getAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) {
  const [votingPower, authorityChains, delegate, votesForProposalAndDelegate] =
    await Promise.all([
      fetchVotingPowerForProposal({
        addressOrENSName: address,
        blockNumber,
        proposalId: proposal_id,
      }),
      fetchAuthorityChains({ address, blockNumber }),
      fetchDelegate(address),
      fetchVotesForProposalAndDelegate({ proposal_id, address }),
    ]);

  return {
    votingPower,
    authorityChains,
    delegate,
    votesForProposalAndDelegate,
  };
}

export const fetchAllForVoting = cache(getAllForVoting);
