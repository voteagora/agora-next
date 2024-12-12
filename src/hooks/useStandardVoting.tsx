import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useWriteContract } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/app/config";

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

  const { writeContractAsync: standardVote, isError: _standardVoteError } =
    useWriteContract();

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
        const { status } = await waitForTransactionReceipt(config, {
          hash: directTx,
        });

        if (status === "success") {
          setStandardTxHash(directTx);
          setStandardVoteSuccess(true);
        }
      } catch (error) {
        setStandardVoteError(true);
      } finally {
        setStandardVoteLoading(false);
      }
    };

    const vote = async () => {
      const trackingData: any = {
        dao_slug: slug,
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
      }
    };

    vote();
  }, [standardVote, missingVote, params, proposalId, reason, support]);

  return {
    isLoading: standardVoteLoading,
    isError: standardVoteError,
    isSuccess: standardVoteSuccess,
    write,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useStandardVoting;
