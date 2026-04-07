"use client";

import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef } from "react";
import {
  useAccount,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { TOKEN_ALLOWANCE_QK } from "@/hooks/useTokenAllowance";
import { useQueryClient } from "@tanstack/react-query";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface PanelSetAllowanceProps {
  amount: bigint;
}

export const PanelSetAllowance = ({ amount }: PanelSetAllowanceProps) => {
  const queryClient = useQueryClient();
  const { contracts, token } = Tenant.current();
  const { address } = useAccount();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const { data: config } = useSimulateContract({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    chainId: contracts.token.chain.id,
    functionName: "approve",
    args: [contracts.staker!.address, amount],
  });

  const { data, writeContract: write } = useWriteContract();
  const { isLoading, isFetched: didUpdateAllowance } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (didUpdateAllowance) {
      if (traceRef.current) {
        attachMiradorTransactionArtifacts(traceRef.current, {
          chainId: contracts.token.chain.id,
          inputData:
            config?.request &&
            "data" in config.request &&
            typeof config.request.data === "string"
              ? config.request.data
              : undefined,
          txHash: data,
          txDetails: "Token allowance approval transaction",
        });
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "staking_allowance_succeeded",
          eventName: "staking_allowance_succeeded",
          details: {
            amount: amount.toString(),
            transactionHash: data,
          },
        });
        traceRef.current = null;
      }
      // Invalidate the token allowance query
      queryClient.invalidateQueries({
        queryKey: [TOKEN_ALLOWANCE_QK],
      });
    }
  }, [
    amount,
    config?.request,
    contracts.token.chain.id,
    data,
    didUpdateAllowance,
    queryClient,
  ]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_allowance_unmounted",
        eventName: "staking_allowance_unmounted",
        details: {
          amount: amount.toString(),
        },
      });
      traceRef.current = null;
    };
  }, [amount]);

  const handleUpdateAllowance = () => {
    if (!config?.request) {
      return;
    }

    if (traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_allowance_restarted",
        eventName: "staking_allowance_restarted",
        details: {
          amount: amount.toString(),
        },
      });
    }

    const trace = startFrontendMiradorFlowTrace({
      name: "StakingAction",
      flow: MIRADOR_FLOW.staking,
      step: "allowance_submit",
      context: {
        walletAddress: address,
        chainId: contracts.token.chain.id,
      },
      tags: ["staking", "frontend"],
      attributes: {
        action: "approve",
        amount: amount.toString(),
      },
      startEventName: "staking_allowance_started",
      startEventDetails: {
        amount: amount.toString(),
      },
    });
    traceRef.current = trace;
    attachMiradorTransactionArtifacts(trace, {
      chainId: contracts.token.chain.id,
      inputData:
        "data" in config.request && typeof config.request.data === "string"
          ? config.request.data
          : undefined,
    });

    try {
      write(config.request);
    } catch (error) {
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "staking_allowance_failed",
        eventName: "staking_allowance_failed",
        details: {
          amount: amount.toString(),
          error: error instanceof Error ? error.message : String(error),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
    }
  };

  return (
    <>
      <div className="text-sm py-4 text-primary">
        Please allow your {token.symbol} tokens to be used for staking.
      </div>

      <Button
        className="w-full"
        disabled={isLoading || !Boolean(config?.request)}
        onClick={handleUpdateAllowance}
      >
        {isLoading ? "Updating..." : "Update Allowance"}
      </Button>
    </>
  );
};
