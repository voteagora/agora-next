"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { type Proposal } from "@/lib/types/proposal";
import { VotingPowerData } from "@/lib/types/votingPower";
import { Delegate } from "@/lib/types/delegate";
import { Vote } from "@/lib/types/vote";

const useFetchAllForVoting = ({
  proposal,
  blockNumber,
}: {
  proposal: Proposal;
  blockNumber?: number;
}) => {
  const { address } = useAccount();
  const finalBlockNumber = blockNumber ?? proposal.snapshotBlockNumber;

  const { data, isSuccess, isPending } = useQuery<{
    votingPower: VotingPowerData | null;
    chains: string[][] | null;
    delegate: Delegate | null;
    votes: Vote[] | null;
  }>({
    enabled: !!address && !!finalBlockNumber,
    queryKey: ["useFetchAllForVoting", address, proposal, finalBlockNumber],
    queryFn: async () => {
      const res = await fetch(
        `/api/common/votes?address=${address}&blockNumber=${finalBlockNumber}&proposalId=${proposal.id}`
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
