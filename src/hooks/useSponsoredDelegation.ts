import { useNonce } from "@/hooks/useNonce";
import Tenant from "@/lib/tenant/tenant";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { Address, encodeFunctionData, zeroAddress } from "viem";
import AgoraAPI from "@/app/lib/agoraAPI";
import { useSignTypedData } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/app/Web3Provider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useEffect, useRef, useState } from "react";
import { useTokenName } from "@/hooks/useTokenName";
import { getPublicClient } from "@/lib/viem";
import { withMiradorTraceHeaders } from "@/lib/mirador/headers";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import { addMiradorEvent } from "@/lib/mirador/webTrace";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  getFrontendMiradorTraceContext,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface Props {
  address: `0x${string}` | undefined;
  delegate: DelegateChunk;
}

const types = {
  Delegation: [
    { name: "delegatee", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
  ],
};
const SPONSORED_DELEGATION_RECEIPT_TIMEOUT_MS = 10 * 60 * 1000;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function addressesMatch(first: string, second: string) {
  return first.toLowerCase() === second.toLowerCase();
}

export const useSponsoredDelegation = ({ address, delegate }: Props) => {
  const { ui, contracts } = Tenant.current();
  const { signTypedDataAsync } = useSignTypedData();

  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const isGasRelayEnabled = ui.toggle("sponsoredDelegate")?.enabled === true;
  const gasRelayConfig =
    (ui.toggle("sponsoredDelegate")?.config as UIGasRelayConfig) || {};

  const { data: nonce } = useNonce({
    address,
    enabled: isGasRelayEnabled && !!address,
  });

  const { data: name } = useTokenName({
    enabled: isGasRelayEnabled && !!address,
  });

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_delegation_unmounted",
        eventName: "governance_delegation_unmounted",
        details: {
          delegatee: delegate.address,
        },
      });
      traceRef.current = null;
    };
  }, [delegate.address]);

  const call = async () => {
    if (nonce === undefined || !name) {
      throw new Error("Unable to process delegation without nonce or name.");
    }

    setIsFetching(true);
    setIsFetched(false);
    setError(undefined);
    setTxHash(undefined);

    const isUndelegation = delegate.address === zeroAddress;
    const action = isUndelegation ? "undelegate" : "delegate";
    let relayTxHash: `0x${string}` | undefined;
    let didSubmitRelayRequest = false;
    const inputData = encodeFunctionData({
      abi: contracts.token.abi as any,
      functionName: "delegate",
      args: [delegate.address as Address],
    });
    const trace = startFrontendMiradorFlowTrace({
      name: "GovernanceDelegation",
      flow: MIRADOR_FLOW.governanceDelegation,
      step: isUndelegation
        ? "undelegation_relay_submit"
        : "delegation_relay_submit",
      context: {
        walletAddress: address,
        chainId: contracts.token.chain.id,
      },
      tags: ["governance", "delegation", "frontend", "relay"],
      attributes: {
        delegatee: delegate.address,
        delegationAction: action,
      },
      startEventName: "governance_delegation_started",
      startEventDetails: {
        delegatee: delegate.address,
        action,
      },
    });
    traceRef.current = trace;
    attachMiradorTransactionArtifacts(trace, {
      chainId: contracts.token.chain.id,
      inputData,
    });

    try {
      const latestBlock = ui.toggle("use-l1-block-number")?.enabled
        ? await contracts.providerForTime?.getBlock("latest")
        : await contracts.token.provider.getBlock("latest");
      const expiry = (latestBlock?.timestamp || 0) + 1000;

      const signature = await signTypedDataAsync({
        domain: {
          ...gasRelayConfig.signature,
          name,
          chainId: contracts.token.chain.id,
          verifyingContract: contracts.token.address as Address,
        },
        types,
        primaryType: "Delegation",
        message: {
          delegatee: delegate.address,
          nonce,
          expiry,
        },
      });

      const traceContext = getFrontendMiradorTraceContext(trace, {
        flow: MIRADOR_FLOW.governanceDelegation,
        step: isUndelegation
          ? "undelegation_relay_request"
          : "delegation_relay_request",
        context: {
          walletAddress: address,
          chainId: contracts.token.chain.id,
        },
      });

      const agoraAPI = new AgoraAPI();
      didSubmitRelayRequest = true;
      const response = await agoraAPI.post(
        "/relay/delegate",
        "v1",
        {
          signature,
          delegatee: delegate.address,
          nonce: nonce.toString(),
          expiry,
        },
        withMiradorTraceHeaders(
          {},
          traceContext?.traceId,
          MIRADOR_FLOW.governanceDelegation
        )
      );

      relayTxHash = (await response.json()) as `0x${string}`;
      setTxHash(relayTxHash);

      attachMiradorTransactionArtifacts(trace, {
        chainId: contracts.token.chain.id,
        txHash: relayTxHash,
        txDetails: isUndelegation
          ? "Sponsored undelegation transaction"
          : "Sponsored delegation transaction",
      });

      addMiradorEvent(trace, "governance_delegation_submitted", {
        delegatee: delegate.address,
        action,
        transactionHash: relayTxHash,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: relayTxHash,
        chainId: contracts.token.chain.id,
        timeout: SPONSORED_DELEGATION_RECEIPT_TIMEOUT_MS,
      });

      if (receipt.status !== "success") {
        throw new Error(
          `Sponsored delegation transaction failed with status: ${receipt.status}`
        );
      }

      void closeFrontendMiradorFlowTrace(trace, {
        reason: "governance_delegation_succeeded",
        eventName: "governance_delegation_succeeded",
        details: {
          delegatee: delegate.address,
          action,
          transactionHash: relayTxHash,
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }

      setIsFetched(true);
    } catch (error) {
      const nextError =
        error instanceof Error ? error : new Error(String(error));

      if (address && (didSubmitRelayRequest || relayTxHash)) {
        try {
          const currentDelegatee = (await getPublicClient(
            contracts.token.chain
          ).readContract({
            address: contracts.token.address as Address,
            abi: contracts.token.abi as any,
            functionName: "delegates",
            args: [address],
          })) as Address;

          const isDelegateStateReconciled = addressesMatch(
            currentDelegatee,
            delegate.address
          );

          addMiradorEvent(
            trace,
            "governance_delegation_reconciliation_checked",
            {
              delegatee: delegate.address,
              action,
              currentDelegatee,
              transactionHash: relayTxHash,
              originalError: nextError.message,
              reconciled: isDelegateStateReconciled,
            }
          );

          if (isDelegateStateReconciled) {
            setError(undefined);
            setTxHash(undefined);
            setIsFetched(true);

            void closeFrontendMiradorFlowTrace(trace, {
              reason: "governance_delegation_succeeded",
              eventName: "governance_delegation_succeeded",
              details: {
                delegatee: delegate.address,
                action,
                currentDelegatee,
                originalTransactionHash: relayTxHash,
                originalError: nextError.message,
                reconciled: true,
              },
            });
            if (traceRef.current === trace) {
              traceRef.current = null;
            }
            return;
          }
        } catch (reconciliationError) {
          addMiradorEvent(
            trace,
            "governance_delegation_reconciliation_failed",
            {
              delegatee: delegate.address,
              action,
              transactionHash: relayTxHash,
              originalError: nextError.message,
              reconciliationError: getErrorMessage(reconciliationError),
            }
          );
        }
      }

      setError(nextError);
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "governance_delegation_failed",
        eventName: "governance_delegation_failed",
        details: {
          delegatee: delegate.address,
          action,
          transactionHash: relayTxHash,
          error: nextError.message,
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
    } finally {
      setIsFetching(false);
    }
  };

  return { call, isFetching, isFetched, isError: !!error, error, txHash };
};
