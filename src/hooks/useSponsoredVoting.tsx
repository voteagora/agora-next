import { useCallback, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useSignTypedData } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/app/Web3Provider";
import AgoraAPI from "@/app/lib/agoraAPI";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { useGovernorName } from "@/hooks/useGovernorName";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";
import { useAccount } from "wagmi";

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
  const { slug, ui, contracts } = Tenant.current();
  const { signTypedDataAsync } = useSignTypedData();
  const { address } = useAccount();
  const isGasRelayEnabled = ui.toggle("sponsoredDelegate")?.enabled === true;
  const gasRelayConfig =
    (ui.toggle("sponsoredVote")?.config as UIGasRelayConfig) || {};

  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [error, setError] = useState<any | undefined>(undefined);
  const [waitingForSignature, setWaitingForSignature] = useState(false);
  const [sponsoredVoteError, setSponsoredVoteError] = useState(false);
  const [sponsoredVoteLoading, setSponsoredVoteLoading] = useState(false);
  const [sponsoredVoteSuccess, setSponsoredVoteSuccess] = useState(false);
  const [sponsoredVoteTxHash, setSponsoredVoteTxHash] = useState<
    string | undefined
  >(undefined);

  const { data: name } = useGovernorName({
    enabled: isGasRelayEnabled,
  });

  const write = useCallback(() => {
    if (!name) {
      throw new Error("Unable to process voting without governor name.");
    }

    const _sponsoredVote = async () => {
      // Sign the vote
      setWaitingForSignature(true);
      try {
        const signature = await signTypedDataAsync({
          domain: {
            ...gasRelayConfig.signature,
            name,
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

        setSignature(signature);
        setWaitingForSignature(false);
        setSponsoredVoteLoading(true);

        const agoraAPI = new AgoraAPI();
        const response = await agoraAPI.post("/relay/vote", "v1", {
          signature,
          proposalId,
          support,
        });
        const voteTxHash = await response.json();
        const { status } = await waitForTransactionReceipt(config, {
          hash: voteTxHash,
          chainId: contracts.governor.chain.id,
        });

        if (status === "success") {
          setSponsoredVoteTxHash(voteTxHash);
          setSponsoredVoteSuccess(true);
          trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
            event_data: {
              proposal_id: proposalId,
              support,
              voter: address as `0x${string}`,
              transaction_hash: voteTxHash,
            },
          });
        } else {
          setSponsoredVoteLoading(false);
          setSponsoredVoteError(true);
        }
      } catch (error) {
        setError(error);
        setSponsoredVoteError(true);
        setWaitingForSignature(false);
        setSponsoredVoteLoading(false);
      } finally {
        setSponsoredVoteLoading(false);
      }
    };

    const vote = async () => {
      await _sponsoredVote();
    };

    vote();
  }, [signTypedDataAsync, contracts, proposalId, support, slug]);

  return {
    isWaitingForSignature: waitingForSignature,
    isSignatureSuccess: !!signature,
    isSignatureError: !!error,
    isLoading: sponsoredVoteLoading || waitingForSignature,
    isError: sponsoredVoteError || !!error,
    isSuccess: sponsoredVoteSuccess,
    error,
    resetError: () => {
      setError(undefined);
      setSponsoredVoteError(false);
    },
    signature,
    write,
    data: { sponsoredVoteTxHash },
  };
};

export default useSponsoredVoting;
