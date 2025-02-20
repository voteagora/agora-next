import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useWriteContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { config } from "@/app/Web3Provider";
import { trackEvent } from "@/lib/analytics";
import { useAccount } from "wagmi";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { wrappedWaitForTransactionReceipt } from "@/lib/utils";
import { getPublicClient } from "@/lib/viem";

const useStandardVoting = ({
  proposalId,
  support,
  reason = "",
  params,
  missingVote,
}: {
  proposalId: string;
  support: number;
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const { contracts, slug } = Tenant.current();
  const { address } = useAccount();
  const { writeContractAsync: standardVote, isError: _standardVoteError } =
    useWriteContract();
  const publicClient = getPublicClient();

  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [standardVoteLoading, setStandardVoteLoading] = useState(false);
  const [standardVoteSuccess, setStandardVoteSuccess] = useState(false);
  const [standardTxHash, setStandardTxHash] = useState<string | undefined>(
    undefined
  );
  const [advancedTxHash, setAdvancedTxHash] = useState<string | undefined>(
    undefined
  );

  const write = useCallback(() => {
    const _standardVote = async () => {
      setStandardVoteLoading(true);
      const directTx = await standardVote({
        address: contracts.governor.address as `0x${string}`,
        abi: contracts.governor.abi,
        functionName: !!reason ? "castVoteWithReason" : "castVote",
        args: !!reason
          ? [BigInt(proposalId), support, reason]
          : [BigInt(proposalId), support],
        chainId: contracts.governor.chain.id,
      });
      try {
        const { status } = await wrappedWaitForTransactionReceipt(
          publicClient,
          {
            hash: directTx,
            address: address as `0x${string}`,
          }
        );

        if (status === "success") {
          setStandardTxHash(directTx);

          await trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
            event_data: {
              proposal_id: proposalId,
              support: support,
              reason: reason,
              params: params,
              voter: address as `0x${string}`,
              transaction_hash: directTx,
            },
          });
          setStandardVoteSuccess(true);
        }
      } catch (error) {
        setStandardVoteError(true);
      } finally {
        setStandardVoteLoading(false);
      }
    };

    const vote = async () => {
      switch (missingVote) {
        case "DIRECT":
          await _standardVote();
          break;
      }
    };

    vote();
  }, [standardVote, missingVote, params, proposalId, reason, support]);

  return {
    isLoading: standardVoteLoading,
    isError: standardVoteError || _standardVoteError,
    resetError: () => setStandardVoteError(false),
    isSuccess: standardVoteSuccess,
    write,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useStandardVoting;
