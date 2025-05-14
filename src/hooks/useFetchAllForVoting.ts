"use client";

import { useQuery } from "@tanstack/react-query";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { Vote } from "@/app/api/common/votes/vote";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";

const useFetchAllForVoting = ({
  proposal,
  blockNumber,
}: {
  proposal: Proposal;
  blockNumber?: number;
}) => {
  const { selectedWalletAddress } = useSelectedWallet();
  const finalBlockNumber = blockNumber ?? proposal.snapshotBlockNumber;

  const { data, isSuccess, isPending } = useQuery<{
    votingPower: VotingPowerData | null;
    chains: string[][] | null;
    delegate: Delegate | null;
    votes: Vote[] | null;
  }>({
    enabled: !!selectedWalletAddress && !!finalBlockNumber,
    queryKey: [
      "useFetchAllForVoting",
      selectedWalletAddress,
      proposal,
      finalBlockNumber,
    ],
    queryFn: async () => {
      const res = await fetch(
        `/api/common/votes?address=${selectedWalletAddress}&blockNumber=${finalBlockNumber}&proposalId=${proposal.id}`
      );

      const {
        votingPower,
        authorityChains,
        delegate,
        votesForProposalAndDelegate,
      } = await res.json();

      return {
        chains: authorityChains,
        delegate,
        votes: votesForProposalAndDelegate,
        votingPower,
      };
    },
  });

  return { data, isSuccess, isPending };
};

export default useFetchAllForVoting;
