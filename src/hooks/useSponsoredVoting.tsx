import { useCallback, useState } from "react";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { useSignTypedData } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/app/Web3Provider";
import {
  prepareVoteBySignature,
  voteBySignature,
} from "@/app/proposals/actions";

const types = {
  Ballot: [
    { name: "proposalId", type: "uint256" },
    { name: "support", type: "uint8" },
  ],
};

const useSponsoredVoting = ({
  proposalId,
  support,
}: {
  proposalId: string;
  support: number;
}) => {
  const { slug, contracts } = Tenant.current();

  const { signTypedData, data: signature, error } = useSignTypedData();

  const [signatureLoading, setSignatureLoading] = useState(false);
  const [sponsoredVoteError, setSponsoredVoteError] = useState(false);
  const [sponsoredVoteLoading, setSponsoredVoteLoading] = useState(false);
  const [sponsoredVoteSuccess, setSponsoredVoteSuccess] = useState(false);
  const [sponsoredVoteTxHash, setSponsoredVoteTxHash] = useState<
    string | undefined
  >(undefined);

  const write = useCallback(() => {
    const _sponsoredVote = async () => {
      setSignatureLoading(true);

      // Sign the vote
      if (!signature) {
        await signTypedData({
          domain: {
            name: "ENS Governor",
            version: "1",
            chainId: contracts.governor.chain.id,
            verifyingContract: contracts.governor.address as `0x${string}`,
          },
          types,
          primaryType: "Ballot",
          message: {
            proposalId: BigInt(proposalId),
            support,
          },
        });
        return;
      }

      setSignatureLoading(false);
      setSponsoredVoteLoading(true);

      const request = await prepareVoteBySignature(
        signature,
        proposalId,
        support
      );

      const voteTxHash = await voteBySignature(request);
      try {
        const { status } = await waitForTransactionReceipt(config, {
          hash: voteTxHash,
          chainId: contracts.governor.chain.id,
        });

        if (status === "success") {
          setSponsoredVoteTxHash(voteTxHash);
          setSponsoredVoteSuccess(true);
        } else {
          setSponsoredVoteLoading(false);
          setSponsoredVoteError(true);
        }
      } catch (error) {
        setSponsoredVoteError(true);
      } finally {
        setSponsoredVoteLoading(false);
      }
    };

    const vote = async () => {
      console.log("Voting");

      const trackingData: any = {
        dao_slug: slug,
        proposal_id: BigInt(proposalId),
        support: support,
      };

      await _sponsoredVote();

      track("Sponsored Vote", trackingData);
    };

    vote();
  }, [signTypedData, contracts, proposalId, support, signature, slug]);

  return {
    isWaitingForSignature: signatureLoading,
    isSignatureSuccess: !!signature,
    isSignatureError: !!error,
    isLoading: sponsoredVoteLoading,
    isError: sponsoredVoteError,
    isSuccess: sponsoredVoteSuccess,
    write,
    data: { sponsoredVoteTxHash },
  };
};

export default useSponsoredVoting;
