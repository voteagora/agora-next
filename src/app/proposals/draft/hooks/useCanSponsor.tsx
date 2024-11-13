"use client";

import { useQuery } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { PLMConfig, ProposalGatingType } from "../types";
import Tenant from "@/lib/tenant/tenant";

const canSponsor = (
  gatingType: ProposalGatingType | undefined,
  manager: `0x${string}` | undefined,
  address: `0x${string}` | undefined,
  accountVotesData: bigint | undefined,
  threshold: bigint | undefined
) => {
  switch (gatingType) {
    case ProposalGatingType.MANAGER:
      return manager === address;
    case ProposalGatingType.TOKEN_THRESHOLD:
      return accountVotesData !== undefined && threshold !== undefined
        ? accountVotesData >= threshold
        : false;
    case ProposalGatingType.GOVERNOR_V1:
      return (
        manager === address ||
        (accountVotesData !== undefined && threshold !== undefined
          ? accountVotesData >= threshold
          : false)
      );
    default:
      return false;
  }
};

export const useCanSponsor = (address: `0x${string}` | undefined) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = (plmToggle?.config as PLMConfig)?.gatingType;

  const { data: threshold, isFetched: isThresholdFetched } =
    useProposalThreshold();
  const { data: manager, isFetched: isManagerFetched } = useManager();
  const { data: blockNumber, isFetched: isBlockNumberFetched } =
    useBlockNumber();
  const { data: accountVotesData, isFetched: isAccountVotesFetched } =
    useGetVotes({
      address: address as `0x${string}`,
      blockNumber: blockNumber || BigInt(0),
    });

  const {
    data: canAddressSponsor,
    isError,
    isFetching,
    isSuccess,
    status,
  } = useQuery({
    queryKey: ["can-sponsor", address, gatingType],
    queryFn: () => {
      return canSponsor(
        gatingType,
        manager as `0x${string}`,
        address as `0x${string}`,
        accountVotesData,
        threshold
      );
    },
    enabled:
      isThresholdFetched &&
      isManagerFetched &&
      isBlockNumberFetched &&
      isAccountVotesFetched,
    staleTime: Infinity,
  });

  return { data: canAddressSponsor, isError, isFetching, isSuccess, status };
};
