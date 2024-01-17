import { OptimismContracts } from "@/lib/contracts/contracts";
import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useEffect, useState } from "react";
import { useContractWrite } from "wagmi";

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
  });

  const {
    write: standardVote,
    isLoading: standardVoteIsLoading,
    isError: standardVoteIsError,
    isSuccess: standardVoteIsSuccess,
  } = useContractWrite({
    address: OptimismContracts.governor.address as any,
    abi: OptimismContracts.governor.abi,
    functionName: reason
      ? params
        ? "castVoteWithReasonAndParams"
        : "castVoteWithReason"
      : "castVote",
    args: reason
      ? params
        ? [BigInt(proposalId), support, reason, params]
        : [BigInt(proposalId), support, reason]
      : ([BigInt(proposalId), support] as any),
  });

  const write = useCallback(() => {
    const vote = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);

      switch (missingVote) {
        case "DIRECT":
          standardVote();
          break;
        case "ADVANCED":
          advancedVote();
          break;
        case "BOTH":
          standardVote();
          advancedVote();
          break;
      }
    };

    vote();
  }, [standardVote, advancedVote, missingVote]);

  useEffect(() => {
    if (advancedVoteIsLoading || standardVoteIsLoading) {
      setIsLoading(true);
    }
    if (advancedVoteIsError || standardVoteIsError) {
      setIsError(true);
      setIsLoading(false);
    }
    if (
      (authorityChains.length === 0 || advancedVoteIsSuccess) &&
      ((!standardVP && authorityChains.length > 0) || standardVoteIsSuccess)
    ) {
      setIsSuccess(true);
      setIsLoading(false);
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
  ]);

  return { isLoading, isError, isSuccess, write };
};

export default useAdvancedVoting;
