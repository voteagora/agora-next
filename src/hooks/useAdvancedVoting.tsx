import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useWriteContract } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/app/Web3Provider";

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
  const { contracts } = Tenant.current();
  const { writeContractAsync: advancedVote, isError: _advancedVoteError } =
    useWriteContract();

  const { writeContractAsync: standardVote, isError: _standardVoteError } =
    useWriteContract();
  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [advancedVoteError, setAdvancedVoteError] =
    useState(_advancedVoteError);
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
      try {
        const { status } = await waitForTransactionReceipt(config, {
          hash: directTx,
        });
        if (status === "success") {
          setStandardTxHash(directTx);
          setStandardVoteSuccess(true);
        }
      } catch (error) {
        console.error(error);
        setStandardVoteError(true);
      } finally {
        setStandardVoteLoading(false);
      }
    };

    const _advancedVote = async () => {
      setAdvancedVoteLoading(true);
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
      try {
        const { status } = await waitForTransactionReceipt(config, {
          hash: advancedTx,
        });
        if (status === "success") {
          setAdvancedTxHash(advancedTx);
          setAdvancedVoteSuccess(true);
        }
      } catch (error) {
        console.error(error);
        setAdvancedVoteError(true);
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
    resetError: () => setAdvancedVoteError(false),
    isSuccess:
      missingVote === "DIRECT" ? standardVoteSuccess : advancedVoteSuccess,
    write,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useAdvancedVoting;
