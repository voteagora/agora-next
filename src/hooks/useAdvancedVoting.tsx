import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/app/Web3Provider";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";

const useAdvancedVoting = ({
  proposalId,
  support,
  advancedVP,
  authorityChains,
  reason = "",
  params,
  missingVote,
}: {
  proposalId: string;
  support: number;
  advancedVP: bigint;
  authorityChains: string[][];
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const { contracts, slug } = Tenant.current();
  const { address } = useAccount();
  const { writeContractAsync: advancedVote } = useWriteContract();
  const { writeContractAsync: standardVote } = useWriteContract();

  const write = useCallback(() => {
    const vote = async () => {
      try {
        // Always allow voting regardless of proposal state
        if (missingVote === "DIRECT") {
          await standardVote({
            address: contracts.governor.address as `0x${string}`,
            abi: contracts.governor.abi,
            functionName: "castVote",
            args: [proposalId, support],
          });
        } else {
          await advancedVote({
            address: contracts.governor.address as `0x${string}`,
            abi: contracts.governor.abi,
            functionName: "castVoteWithReasonAndParams",
            args: [proposalId, support, reason || "", params || "0x"],
          });
        }
      } catch (error) {
        console.error("Voting error:", error);
      }
    };

    vote();
  }, [
    standardVote,
    advancedVote,
    missingVote,
    params,
    proposalId,
    reason,
    support,
  ]);

  return {
    write,
    isLoading: false,
    isError: false,
    isSuccess: false,
    data: { advancedTxHash: undefined, standardTxHash: undefined },
  };
};

export default useAdvancedVoting;
