import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useWriteContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { trackEvent } from "@/lib/analytics";
import { useAccount } from "wagmi";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";
import { wrappedWaitForTransactionReceipt } from "@/lib/utils";
import { WriteContractErrorType } from "wagmi/actions";

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
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const {
    writeContractAsync: standardVote,
    isError: _standardVoteError,
    error: _error,
  } = useWriteContract();

  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [standardVoteErrorDetails, setStandardVoteErrorDetails] =
    useState<WriteContractErrorType | null>(_error);
  const [standardVoteLoading, setStandardVoteLoading] = useState(false);
  const [standardVoteSuccess, setStandardVoteSuccess] = useState(false);
  const [standardTxHash, setStandardTxHash] = useState<string | undefined>(
    undefined
  );
  const [advancedTxHash] = useState<string | undefined>(undefined);

  const write = useCallback(() => {
    const _standardVote = async () => {
      setStandardVoteLoading(true);
      try {
        const directTx = await standardVote({
          address: contracts.governor.address as `0x${string}`,
          abi: contracts.governor.abi,
          functionName: !!reason ? "castVoteWithReason" : "castVote",
          args: !!reason
            ? [BigInt(proposalId), support, reason]
            : [BigInt(proposalId), support],
          chainId: contracts.governor.chain.id,
        });

        const { status, transactionHash } =
          await wrappedWaitForTransactionReceipt({
            hash: directTx,
            address: address as `0x${string}`,
          });

        if (status === "success") {
          setStandardTxHash(transactionHash);

          await trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
            event_data: {
              proposal_id: proposalId,
              support: support,
              reason: reason,
              params: params,
              voter: address as `0x${string}`,
              transaction_hash: transactionHash,
            },
          });
          setStandardVoteSuccess(true);
        }
      } catch (error) {
        setStandardVoteError(true);
        setStandardVoteErrorDetails(_error);
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
    resetError: () => {
      setStandardVoteError(false);
      setStandardVoteErrorDetails(null);
    },
    isSuccess: standardVoteSuccess,
    write,
    error: standardVoteErrorDetails,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useStandardVoting;
