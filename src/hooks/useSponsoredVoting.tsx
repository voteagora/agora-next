import { useCallback, useEffect, useRef, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAccount, useSignTypedData } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { encodeFunctionData } from "viem";
import { config } from "@/app/Web3Provider";
import AgoraAPI from "@/app/lib/agoraAPI";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { useGovernorName } from "@/hooks/useGovernorName";
import { trackEventFireAndForget } from "@/lib/analytics";
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
import { addMiradorEvent } from "@/lib/mirador/webTrace";
import { getWalletTraceAttributes } from "@/lib/mirador/walletTraceAttributes";
import { checkWalletReadinessOrCloseTrace } from "@/lib/wallet/transactionReadiness";

const types = {
  Ballot: [
    { name: "proposalId", type: "uint256" },
    { name: "support", type: "uint8" },
  ],
};
const SPONSORED_VOTE_RECEIPT_TIMEOUT_MS = 10 * 60 * 1000;

const useSponsoredVoting = ({
  proposalId,
  support,
}: {
  proposalId: string;
  support: number;
}) => {
  const { ui, contracts } = Tenant.current();
  const { signTypedDataAsync } = useSignTypedData();
  const {
    address,
    chainId: accountChainId,
    connector,
    status: accountStatus,
  } = useAccount();
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
      let relayTxHash: `0x${string}` | undefined;
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
          ...getWalletTraceAttributes({
            accountChainId,
            accountStatus,
            connector,
            targetChainId: contracts.governor.chain.id,
          }),
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

      const readinessError = checkWalletReadinessOrCloseTrace({
        connector,
        status: accountStatus,
        trace,
        traceRef,
        proposalId,
        voteKind: "sponsored",
      });
      if (readinessError) {
        setError(readinessError);
        setSponsoredVoteError(true);
        return;
      }

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
        relayTxHash = (await response.json()) as `0x${string}`;
        addMiradorEvent(trace, "governance_vote_relay_broadcasted", {
          proposalId,
          voteKind: "sponsored",
          support,
          transactionHash: relayTxHash,
          confirmationState: "awaiting_receipt",
          receiptTimeoutMs: SPONSORED_VOTE_RECEIPT_TIMEOUT_MS,
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash: relayTxHash,
          chainId: contracts.governor.chain.id,
          timeout: SPONSORED_VOTE_RECEIPT_TIMEOUT_MS,
        });

        if (receipt.status === "success") {
          addMiradorEvent(trace, "governance_vote_relay_confirmed", {
            proposalId,
            voteKind: "sponsored",
            support,
            transactionHash: relayTxHash,
            receiptStatus: receipt.status,
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber?.toString(),
            transactionIndex: receipt.transactionIndex,
          });
          attachMiradorTransactionArtifacts(trace, {
            chainId: contracts.governor.chain.id,
            inputData,
            txHash: relayTxHash,
            txDetails: "Sponsored governance vote transaction confirmed",
          });
          setSponsoredVoteTxHash(relayTxHash);
          setSponsoredVoteSuccess(true);
          trackEventFireAndForget({
            event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
            event_data: {
              proposal_id: proposalId,
              support,
              voter: address as `0x${string}`,
              transaction_hash: relayTxHash,
            },
          });
          void closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_succeeded",
            eventName: "governance_vote_succeeded",
            details: {
              proposalId,
              voteKind: "sponsored",
              transactionHash: relayTxHash,
              receiptStatus: receipt.status,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        } else {
          const receiptError = new Error(
            `Sponsored vote transaction failed with status: ${receipt.status}`
          );
          setError(receiptError);
          setSponsoredVoteError(true);
          addMiradorEvent(trace, "governance_vote_relay_confirmation_failed", {
            proposalId,
            voteKind: "sponsored",
            support,
            transactionHash: relayTxHash,
            receiptStatus: receipt.status,
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber?.toString(),
            transactionIndex: receipt.transactionIndex,
            error: receiptError.message,
          });
          void closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_failed",
            eventName: "governance_vote_failed",
            details: {
              proposalId,
              voteKind: "sponsored",
              transactionHash: relayTxHash,
              error: receiptError.message,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        }
      } catch (error) {
        const nextError = getSponsoredVoteError(error, relayTxHash);
        setError(nextError);
        setSponsoredVoteError(true);
        setWaitingForSignature(false);
        if (relayTxHash) {
          addMiradorEvent(trace, "governance_vote_relay_confirmation_failed", {
            proposalId,
            voteKind: "sponsored",
            support,
            transactionHash: relayTxHash,
            receiptTimeoutMs: SPONSORED_VOTE_RECEIPT_TIMEOUT_MS,
            error: nextError.message,
          });
        }
        void closeFrontendMiradorFlowTrace(trace, {
          reason: "governance_vote_failed",
          eventName: "governance_vote_failed",
          details: {
            proposalId,
            voteKind: "sponsored",
            transactionHash: relayTxHash,
            error: nextError.message,
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
    accountChainId,
    accountStatus,
    connector,
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

function getSponsoredVoteError(
  error: unknown,
  relayTxHash?: `0x${string}`
): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (relayTxHash && isReceiptTimeoutError(message)) {
    return new Error(
      `Sponsored vote transaction ${relayTxHash} was broadcast but was not confirmed within 10 minutes.`
    );
  }

  return error instanceof Error ? error : new Error(message);
}

function isReceiptTimeoutError(message: string) {
  return /timed?\s*out|timeout/i.test(message);
}

export default useSponsoredVoting;
