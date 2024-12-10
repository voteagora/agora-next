"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { fetchAllForVoting } from "@/app/proposals/actions";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";

const useFetchAllForVoting = ({ proposal }: { proposal: Proposal }) => {
  const { ui } = Tenant.current();
  const scwConfig = ui.smartAccountConfig;

  const { address } = useAccount();
  const { data: scwAddress } = useSmartAccountAddress({ owner: address });

  const voterAddress = scwConfig ? scwAddress : address;

  const { data, isSuccess } = useQuery({
    enabled: !!voterAddress && !!proposal.snapshotBlockNumber,
    queryKey: ["useFetchAllForVoting", voterAddress, proposal],
    queryFn: async () => {
      const {
        votingPower,
        authorityChains,
        delegate,
        votesForProposalAndDelegate,
      } = await fetchAllForVoting(
        voterAddress!,
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
