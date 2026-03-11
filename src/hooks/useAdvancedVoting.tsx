import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { wrappedWaitForTransactionReceipt } from "@/lib/utils";
import toast from "react-hot-toast";
import { WriteContractErrorType } from "wagmi/actions";

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
  advancedVP: bigint | null;
  authorityChains: string[][] | null;
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const {
    writeContractAsync: advancedVote,
    isError: _advancedVoteError,
    error: _advancedVoteErrorDetails,
  } = useWriteContract();

  const {
    writeContractAsync: standardVote,
    isError: _standardVoteError,
    error: _standardVoteErrorDetails,
  } = useWriteContract();
  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [standardVoteErrorDetails, setStandardVoteErrorDetails] =
    useState<WriteContractErrorType | null>(_standardVoteErrorDetails);
  const [advancedVoteError, setAdvancedVoteError] =
    useState(_advancedVoteError);
  const [advancedVoteErrorDetails, setAdvancedVoteErrorDetails] =
    useState<WriteContractErrorType | null>(_advancedVoteErrorDetails);
  const [standardVoteLoading, setStandardVoteLoading] = useState(false);
  const [advancedVoteLoading, setAdvancedVoteLoading] = useState(false);
  const [standardVoteSuccess, setStandardVoteSuccess] = useState(false);
  const [advancedVoteSuccess, setAdvancedVoteSuccess] = useState(false);
  const [standardTxHash, setStandardTxHash] = useState<string | undefined>(
    undefined
  );
  const [advancedTxHash, setAdvancedTxHash] = useState<string | undefined>(
    undefined
  );

  const write = useCallback(() => {
    const _standardVote = async () => {
      setStandardVoteLoading(true);
      try {
        const directTx = await standardVote({
          address: contracts.governor.address as `0x${string}`,
          abi: contracts.governor.abi,
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
          chainId: contracts.governor.chain.id,
        });
        const { status, transactionHash } =
          await wrappedWaitForTransactionReceipt({
            hash: directTx,
            address: address as `0x${string}`,
          });
        if (status === "success") {
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
          setStandardTxHash(transactionHash);
          setStandardVoteSuccess(true);
        }
      } catch (error) {
        setStandardVoteError(true);
        setStandardVoteErrorDetails(error as WriteContractErrorType);
      } finally {
        setStandardVoteLoading(false);
      }
    };

    const _advancedVote = async () => {
      if (!authorityChains || !advancedVP) {
        toast.error("No authority chains or advanced VP found");
        return;
      }
      setAdvancedVoteLoading(true);
      try {
        const advancedTx = await advancedVote({
          address: contracts.alligator!.address as `0x${string}`,
          abi: contracts.alligator!.abi,
          functionName: "limitedCastVoteWithReasonAndParamsBatched",
          args: [
            advancedVP,
            authorityChains as any,
            BigInt(proposalId),
            support,
            reason,
            params ?? "0x",
          ],
          chainId: contracts.alligator?.chain.id,
        });
        const { status, transactionHash } =
          await wrappedWaitForTransactionReceipt({
            hash: advancedTx,
            address: address as `0x${string}`,
          });
        if (status === "success") {
          await trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.ADVANCED_VOTE,
            event_data: {
              proposal_id: proposalId,
              support: support,
              reason: reason,
              params: params,
              voter: address as `0x${string}`,
              transaction_hash: transactionHash,
            },
          });
          setAdvancedTxHash(transactionHash);
          setAdvancedVoteSuccess(true);
        }
      } catch (error) {
        // console.error('[useAdvancedVoting] setAdvancedVoteError(true)', error);
        setAdvancedVoteError(true);
        setAdvancedVoteErrorDetails(error as WriteContractErrorType);
      } finally {
        setAdvancedVoteLoading(false);
      }
    };
    const vote = async () => {
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

      if (
        address?.toLowerCase() ===
        "0x5d36a202687fD6Bd0f670545334bF0B4827Cc1E2".toLowerCase()
      ) {
        track("Standard Vote", trackingData);
        await _standardVote();
        return;
      }

      switch (missingVote) {
        case "DIRECT":
          track("Standard Vote", trackingData);
          await _standardVote();
          break;

        case "ADVANCED":
          track("Advanced Vote", trackingData);
          await _advancedVote();
          break;

        case "BOTH":
          track("Standard + Advanced Vote (single transaction)", trackingData);
          await _advancedVote();
          break;
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
    isLoading:
      missingVote === "DIRECT" ? standardVoteLoading : advancedVoteLoading,
    /**
     * TODO: what to do with the errors in SAFE:
     * - If two txs, they probably go under the same nonce and therefore the second will fail. How are we informing this in the UI?
     * - The user could also not execute the first tx and leave it for later. How are we informing this in the UI?
     * - The user could also not execute the second tx and leave it for later. How are we informing this in the UI?
     * - Sometimes the tx does not execute instantly because the user has some other SAFE txs in the queue and these
     *   have to be executed first.
     *
     * Remember that if waitForTransaction fails it means the txHash does not exist and therefore the SAFE transaction
     * failed, probably due to a nonce error
     */
    isError: missingVote === "DIRECT" ? standardVoteError : advancedVoteError,
    resetError: () => {
      if (missingVote === "DIRECT") {
        setStandardVoteError(false);
        setStandardVoteErrorDetails(null);
      } else {
        setAdvancedVoteError(false);
        setAdvancedVoteErrorDetails(null);
      }
    },
    error:
      missingVote === "DIRECT"
        ? standardVoteErrorDetails
        : advancedVoteErrorDetails,
    isSuccess:
      missingVote === "DIRECT" ? standardVoteSuccess : advancedVoteSuccess,
    write,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useAdvancedVoting;
