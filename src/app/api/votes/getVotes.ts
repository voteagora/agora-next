import { getVotingPowerForProposal } from "../voting-power/getVotingPower";
import { getAuthorityChains } from "../authority-chains/getAuthorityChains";
import { getDelegate } from "../delegates/getDelegates";
import { getVotesForProposalAndDelegate } from "../common/votes/getVotes";

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
      getDelegate({ addressOrENSName: address }),
      getVotesForProposalAndDelegate({ proposal_id, address }),
    ]);

  return {
    votingPower,
    authorityChains,
    delegate,
    votesForProposalAndDelegate,
  };
}
