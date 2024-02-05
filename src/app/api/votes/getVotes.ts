import { getVotingPowerAtSnapshot } from "../voting-power/getVotingPower";
import { getAuthorityChains } from "../authority-chains/getAuthorityChains";
import { getDelegate } from "../delegates/getDelegates";
import {
  getUserVotesForProposalForNamespace,
  getVotesForDelegateForNamespace,
  getVotesForProposalAndDelegateForNamespace,
  getVotesForProposalForNamespace,
} from "../common/votes/getVotes";
import { VotesSort, VotesSortOrder } from "../common/votes/vote";

export const getVotesForDelegate = ({
  addressOrENSName,
  page,
  sort,
  sortOrder,
}: {
  addressOrENSName: string;
  page: number;
  sort: VotesSort | undefined;
  sortOrder: VotesSortOrder | undefined;
}) =>
  getVotesForDelegateForNamespace({
    addressOrENSName,
    page,
    sort,
    sortOrder,
    namespace: "optimism",
  });

export const getVotesForProposal = ({
  proposal_id,
  page = 1,
  sort = "weight",
  sortOrder = "desc",
}: {
  proposal_id: string;
  page?: number;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
}) =>
  getVotesForProposalForNamespace({
    proposal_id,
    page,
    sort,
    sortOrder,
    namespace: "optimism",
  });

export const getUserVotesForProposal = ({
  proposal_id,
  address,
}: {
  proposal_id: string;
  address: string;
}) =>
  getUserVotesForProposalForNamespace({
    proposal_id,
    address,
    namespace: "optimism",
  });

export const getVotesForProposalAndDelegate = ({
  proposal_id,
  address,
}: {
  proposal_id: string;
  address: string;
}) =>
  getVotesForProposalAndDelegateForNamespace({
    proposal_id,
    address,
    namespace: "optimism",
  });

export async function getAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) {
  const [votingPower, authorityChains, delegate, votesForProposalAndDelegate] =
    await Promise.all([
      getVotingPowerAtSnapshot({ addressOrENSName: address, blockNumber }),
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
