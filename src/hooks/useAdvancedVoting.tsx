import { OptimismContracts } from "@/lib/contracts/contracts";
import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useEffect, useState } from "react";
import { useContractWrite } from "wagmi";
import { track } from "@vercel/analytics";
import { optimism } from "viem/chains";

const useAdvancedVoting = ({
  proposalId,
  support,
  standardVP,
  advancedVP,
  authorityChains,
  reason = "",
  params,
  missingVote,
}: {
  proposalId: string;
  support: number;
  standardVP: bigint;
  advancedVP: bigint;
  authorityChains: string[][];
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    write: advancedVote,
    isLoading: advancedVoteIsLoading,
    isError: advancedVoteIsError,
    isSuccess: advancedVoteIsSuccess,
    data: advancedVoteData,
  } = useContractWrite({
    address: OptimismContracts.alligator.address as any,
    abi: OptimismContracts.alligator.abi,
    functionName: "limitedCastVoteWithReasonAndParamsBatched",
    args: [
      advancedVP,
      authorityChains as any,
      BigInt(proposalId),
      support,
      reason,
      params ?? "0x",
    ],
    chainId: optimism.id,
  });

  const {
    write: standardVote,
    isLoading: standardVoteIsLoading,
    isError: standardVoteIsError,
    isSuccess: standardVoteIsSuccess,
    data: standardVoteData,
  } = useContractWrite({
    address: OptimismContracts.governor.address as any,
    abi: OptimismContracts.governor.abi,
    functionName: reason
      ? params
        ? "castVoteWithReasonAndParams"
        : "castVoteWithReason"
      : params
      ? "castVoteWithReasonAndParams"
      : "castVote",
    args: reason
      ? params
        ? [BigInt(proposalId), support, reason, params]
        : [BigInt(proposalId), support, reason]
      : params
      ? [BigInt(proposalId), support, reason, params]
      : ([BigInt(proposalId), support] as any),
    chainId: optimism.id,
  });

  const write = useCallback(() => {
    const vote = async () => {
      setIsError(false);
      setIsSuccess(false);

      const trackingData: any = {
        dao_slug: "OP",
        proposal_id: BigInt(proposalId),
        support: support,
      };

      if (reason) {
        trackingData.reason = reason;
      }

      if (params) {
        trackingData.params = params;
      }

      switch (missingVote) {
        case "DIRECT":
          track("Standard Vote", trackingData);
          standardVote();
          break;
        case "ADVANCED":
          track("Advanced Vote", trackingData);
          advancedVote();
          break;
        case "BOTH":
          track("Standard + Advanced Vote", trackingData);
          standardVote();
          advancedVote();
          break;
      }
    };

    vote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standardVote, advancedVote, missingVote]);

  useEffect(() => {
    if (advancedVoteIsLoading || standardVoteIsLoading) {
      setIsLoading(true);
    }
    if (advancedVoteIsError || standardVoteIsError) {
      setIsError(true);
      setIsLoading(false);
    }
    switch (missingVote) {
      case "BOTH":
        if (advancedVoteIsSuccess && standardVoteIsSuccess) {
          setIsSuccess(true);
          setIsLoading(false);
        }
        break;
      default:
        if (advancedVoteIsSuccess || standardVoteIsSuccess) {
          setIsSuccess(true);
          setIsLoading(false);
        }
        break;
    }
  }, [
    advancedVoteIsLoading,
    standardVoteIsLoading,
    advancedVoteIsError,
    standardVoteIsError,
    advancedVoteIsSuccess,
    standardVoteIsSuccess,
    authorityChains,
    standardVP,
    missingVote,
  ]);

  return {
    isLoading,
    isError,
    error: advancedVoteIsError,
    isSuccess,
    write,
    data: { advancedVoteData, standardVoteData },
  };
};

export default useAdvancedVoting;
