import { useCallback, useEffect, useRef, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAccount, useSignTypedData } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { encodeFunctionData } from "viem";
import { config } from "@/app/Web3Provider";
import AgoraAPI from "@/app/lib/agoraAPI";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { useGovernorName } from "@/hooks/useGovernorName";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { withMiradorTraceHeaders } from "@/lib/mirador/headers";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  getFrontendMiradorTraceContext,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

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
  const { ui, contracts } = Tenant.current();
  const { signTypedDataAsync } = useSignTypedData();
  const { address } = useAccount();
  const isGasRelayEnabled = ui.toggle("sponsoredVote")?.enabled === true;
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
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const { data: name } = useGovernorName({
    enabled: isGasRelayEnabled,
  });

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_vote_unmounted",
        eventName: "governance_vote_unmounted",
        details: {
          proposalId,
          voteKind: "sponsored",
        },
      });
      traceRef.current = null;
    };
  }, [proposalId]);

  const write = useCallback(() => {
    if (!name) {
      throw new Error("Unable to process voting without governor name.");
    }

    const _sponsoredVote = async () => {
      const inputData = encodeFunctionData({
        abi: contracts.governor.abi as any,
        functionName: "castVote",
        args: [BigInt(proposalId), support],
      });
      const trace = startFrontendMiradorFlowTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step: "sponsored_vote_submit",
        context: {
          walletAddress: address,
          chainId: contracts.governor.chain.id,
          proposalId,
        },
        tags: ["governance", "vote", "frontend", "relay"],
        attributes: {
          voteKind: "sponsored",
          support,
        },
        startEventName: "governance_vote_started",
        startEventDetails: {
          proposalId,
          voteKind: "sponsored",
          support,
        },
      });
      traceRef.current = trace;
      attachMiradorTransactionArtifacts(trace, {
        chainId: contracts.governor.chain.id,
        inputData,
      });

      setWaitingForSignature(true);
      try {
        const nextSignature = await signTypedDataAsync({
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

        setSignature(nextSignature);
        setWaitingForSignature(false);
        setSponsoredVoteLoading(true);
        const traceContext = getFrontendMiradorTraceContext(trace, {
          flow: MIRADOR_FLOW.governanceVote,
          step: "relay_vote_request",
          context: {
            walletAddress: address,
            chainId: contracts.governor.chain.id,
            proposalId,
          },
        });

        const agoraAPI = new AgoraAPI();
        const response = await agoraAPI.post(
          "/relay/vote",
          "v1",
          {
            signature: nextSignature,
            proposalId,
            support,
          },
          withMiradorTraceHeaders(
            {},
            traceContext?.traceId,
            MIRADOR_FLOW.governanceVote
          )
        );
        const voteTxHash = await response.json();
        const { status } = await waitForTransactionReceipt(config, {
          hash: voteTxHash,
          chainId: contracts.governor.chain.id,
        });

        if (status === "success") {
          attachMiradorTransactionArtifacts(trace, {
            chainId: contracts.governor.chain.id,
            inputData,
            txHash: voteTxHash,
            txDetails: "Sponsored governance vote transaction",
          });
          setSponsoredVoteTxHash(voteTxHash);
          setSponsoredVoteSuccess(true);
          await trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
            event_data: {
              proposal_id: proposalId,
              support,
              voter: address as `0x${string}`,
              transaction_hash: voteTxHash,
            },
          });
          void closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_succeeded",
            eventName: "governance_vote_succeeded",
            details: {
              proposalId,
              voteKind: "sponsored",
              transactionHash: voteTxHash,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        } else {
          setSponsoredVoteError(true);
          void closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_failed",
            eventName: "governance_vote_failed",
            details: {
              proposalId,
              voteKind: "sponsored",
              error: `Unexpected vote receipt status: ${status}`,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        }
      } catch (error) {
        setError(error);
        setSponsoredVoteError(true);
        setWaitingForSignature(false);
        void closeFrontendMiradorFlowTrace(trace, {
          reason: "governance_vote_failed",
          eventName: "governance_vote_failed",
          details: {
            proposalId,
            voteKind: "sponsored",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        if (traceRef.current === trace) {
          traceRef.current = null;
        }
      } finally {
        setSponsoredVoteLoading(false);
      }
    };

    void _sponsoredVote();
  }, [
    address,
    contracts.governor.abi,
    contracts.governor.address,
    contracts.governor.chain.id,
    gasRelayConfig.signature,
    name,
    proposalId,
    signTypedDataAsync,
    support,
  ]);

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
