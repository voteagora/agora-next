import { getVotesForProposalAndDelegate } from "../common/votes/getVotes";
import { getVotingPowerForProposal } from "@/app/api/common/voting-power/getVotingPower";
import { getDelegate } from "@/app/api/common/delegates/getDelegates";
import { getAuthorityChains } from "@/app/api/common/authority-chains/getAuthorityChains";

export async function getAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) {
  const [votingPower, authorityChains, delegate, votesForProposalAndDelegate] =
    await Promise.all([
      getVotingPowerForProposal({
        addressOrENSName: address,
        blockNumber,
        proposalId: proposal_id,
      }),
      getAuthorityChains({ address, blockNumber }),
      getDelegate(address),
      getVotesForProposalAndDelegate({ proposal_id, address }),
    ]);

  return {
    votingPower,
    authorityChains,
    delegate,
    votesForProposalAndDelegate,
  };
}
