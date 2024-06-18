import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useContractWrite } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { waitForTransaction } from "wagmi/actions";

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

  const { writeAsync: standardVote, isError: _standardVoteError } =
    useContractWrite({
      address: contracts.governor.address as `0x${string}`,
      abi: contracts.governor.abi,
      functionName: !!reason ? "castVoteWithReason" : "castVote",
      args: !!reason
        ? [BigInt(proposalId), support, reason]
        : [BigInt(proposalId), support],
      chainId: contracts.governor.chain.id,
    });

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
      const directTx = await standardVote();
      try {
        const { status } = await waitForTransaction({
          hash: directTx.hash,
        });

        if (status === "success") {
          setStandardTxHash(directTx.hash);
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
