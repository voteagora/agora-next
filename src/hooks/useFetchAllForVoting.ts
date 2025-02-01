"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { fetchAllForVoting } from "@/app/proposals/actions";
import { type Proposal } from "@/app/api/common/proposals/proposal";

type FetchAllForVotingProps = {
  proposal: Proposal;
  blockNumber?: number;
};

const useFetchAllForVoting = ({
  proposal,
  blockNumber,
}: FetchAllForVotingProps) => {
  const { address } = useAccount();

  const { data, isSuccess } = useQuery({
    enabled: !!address && !!proposal.snapshotBlockNumber,
    queryKey: ["useFetchAllForVoting", address, proposal.id, blockNumber],
    queryFn: async () => {
      const {
        votingPower,
        authorityChains,
        delegate,
        votesForProposalAndDelegate,
      } = await fetchAllForVoting(
        address!,
        blockNumber || proposal.snapshotBlockNumber,
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
