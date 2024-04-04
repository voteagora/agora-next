"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { fetchAllForVoting } from "@/app/proposals/actions";
import { type Proposal } from "@/app/api/common/proposals/proposal";

const useFetchAllForVoting = ({ proposal }: { proposal: Proposal }) => {
  const { address } = useAccount();

  const { data, isSuccess } = useQuery({
    enabled: !!address && !!proposal.snapshotBlockNumber,
    queryKey: ["useFetchAllForVoting", address, proposal],
    queryFn: async () => {
      const {
        votingPower,
        authorityChains,
        delegate,
        votesForProposalAndDelegate,
      } = await fetchAllForVoting(
        address!,
        proposal.snapshotBlockNumber,
        proposal.id
      );

      return {
        chains: authorityChains,
        delegate,
        votes: votesForProposalAndDelegate,
        votingPower,
      };
    },
  });

  return { ...data, isSuccess };
};

export default useFetchAllForVoting;
