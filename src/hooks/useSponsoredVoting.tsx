import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useState } from "react";
import { useContractWrite } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { waitForTransaction } from "wagmi/actions";
import { useSignTypedData } from "wagmi";
import { voteBySiganatureApi } from "@/app/api/common/votes/castVote";

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

      // TODO: Simulate the vote

      // Wait for the transaction

      console.log("Voting");

      const voteTxHash = await voteBySiganatureApi({
        signature,
        proposalId,
        support,
      });
      try {
        const { status } = await waitForTransaction({
          hash: voteTxHash,
        });

        if (status === "success") {
          setSponsoredVoteTxHash(voteTxHash);
          setSponsoredVoteSuccess(true);
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
