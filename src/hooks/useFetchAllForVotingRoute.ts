"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { type Proposal } from "@/app/api/common/proposals/proposal";

const useFetchAllForVotingRoute = ({ proposal }: { proposal: Proposal }) => {
  const { address } = useAccount();

  const { data, isSuccess } = useQuery({
    enabled: !!address && !!proposal.snapshotBlockNumber,
    queryKey: ["useFetchAllForVotingRoute", address, proposal],
    queryFn: async () => {
      const res = await fetch(
        `/api/common/votes?address=${address}&blockNumber=${proposal.snapshotBlockNumber}&proposalId=${proposal.id}`
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

  return { data, isSuccess };
};

export default useFetchAllForVotingRoute;
