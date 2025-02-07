"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { type Proposal } from "@/app/api/common/proposals/proposal";

const useFetchAllForVoting = ({
  proposal,
  blockNumber,
}: {
  proposal: Proposal;
  blockNumber?: number;
}) => {
  const { address } = useAccount();
  const finalBlockNumber = blockNumber ?? proposal.snapshotBlockNumber;

  const { data, isSuccess } = useQuery({
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

  return { data, isSuccess };
};

export default useFetchAllForVoting;
