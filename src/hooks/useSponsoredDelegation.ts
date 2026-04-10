import { useNonce } from "@/hooks/useNonce";
import Tenant from "@/lib/tenant/tenant";
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { Address, encodeFunctionData, zeroAddress } from "viem";
import AgoraAPI from "@/app/lib/agoraAPI";
import { useSignTypedData } from "wagmi";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useEffect, useRef, useState } from "react";
import { useTokenName } from "@/hooks/useTokenName";
import { withMiradorTraceHeaders } from "@/lib/mirador/headers";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
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

export const useSponsoredDelegation = ({ address, delegate }: Props) => {
  const { ui, contracts } = Tenant.current();
  const { signTypedDataAsync } = useSignTypedData();

  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
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

    const isUndelegation = delegate.address === zeroAddress;
    const action = isUndelegation ? "undelegate" : "delegate";
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

      const hash = await response.json();

      attachMiradorTransactionArtifacts(trace, {
        chainId: contracts.token.chain.id,
        inputData,
        txHash: hash,
        txDetails: isUndelegation
          ? "Sponsored undelegation transaction"
          : "Sponsored delegation transaction",
      });
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "governance_delegation_submitted",
        eventName: "governance_delegation_submitted",
        details: {
          delegatee: delegate.address,
          action,
          transactionHash: hash,
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }

      setTxHash(hash);
      setIsFetched(true);
    } catch (error) {
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "governance_delegation_failed",
        eventName: "governance_delegation_failed",
        details: {
          delegatee: delegate.address,
          action,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
      throw error;
    } finally {
      setIsFetching(false);
    }
  };

  return { call, isFetching, isFetched, txHash };
};
