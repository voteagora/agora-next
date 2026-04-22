"use client";

import React, { useEffect, useRef } from "react";
import Tenant from "@/lib/tenant/tenant";
import {
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { formatNumber, numberToToken } from "@/lib/utils";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { RedirectAfterSuccess } from "@/app/staking/components/RedirectAfterSuccess";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { PanelSetAllowance } from "@/app/staking/components/PanelSetAllowance";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface NewStakeConfirmProps {
  amount: number;
  delegate: string;
  depositor: string;
  refreshPath: (path: string) => void;
}

export const NewStakeConfirm = ({
  amount,
  delegate,
  depositor,
  refreshPath,
}: NewStakeConfirmProps) => {
  const { token, contracts } = Tenant.current();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  // Check if a user has allowed the staking contract to spend their tokens
  const { data: allowance, isFetched: isLoadedAllowance } =
    useTokenAllowance(depositor);
  const hasAllowance = isLoadedAllowance && allowance !== undefined;

  const { data: maxBalance, isFetched: isLoadedMaxBalance } =
    useTokenBalance(depositor);

  // There are cases where the amount might be higher than the balance of available tokes due to artifacts of
  // number to BigInt conversion. In such cases, we need to ensure that the amount to stake is capped at the maximum.
  const amountToStake =
    maxBalance && numberToToken(amount) > maxBalance
      ? maxBalance
      : numberToToken(amount);

  const isSufficientSpendingAllowance =
    hasAllowance && allowance >= amountToStake;

  const { data: config } = useSimulateContract({
    query: { enabled: isSufficientSpendingAllowance },
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stake",
    args: [amountToStake, delegate],
  });

  const { data, writeContract: write } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: data,
  });
  const isTransactionConfirmed = Boolean(data && !isLoading);

  useEffect(() => {
    if (isSuccess && traceRef.current) {
      attachMiradorTransactionArtifacts(traceRef.current, {
        chainId: contracts.staker!.chain.id,
        inputData:
          config?.request &&
          "data" in config.request &&
          typeof config.request.data === "string"
            ? config.request.data
            : undefined,
        txHash: data,
        txDetails: "Stake transaction",
      });
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_succeeded",
        eventName: "staking_submit_succeeded",
        details: {
          amount: amountToStake.toString(),
          delegate,
          transactionHash: data,
        },
      });
      traceRef.current = null;
      return;
    }

    if (isError && traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_failed",
        eventName: "staking_submit_failed",
        details: {
          amount: amountToStake.toString(),
          delegate,
        },
      });
      traceRef.current = null;
    }
  }, [
    amountToStake,
    config?.request,
    contracts.staker,
    data,
    delegate,
    isError,
    isSuccess,
  ]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_unmounted",
        eventName: "staking_submit_unmounted",
        details: {
          amount: amountToStake.toString(),
          delegate,
        },
      });
      traceRef.current = null;
    };
  }, [amountToStake, delegate]);

  const handleStake = () => {
    if (!config?.request) {
      return;
    }

    if (traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_restarted",
        eventName: "staking_submit_restarted",
        details: {
          amount: amountToStake.toString(),
          delegate,
        },
      });
    }

    const trace = startFrontendMiradorFlowTrace({
      name: "StakingAction",
      flow: MIRADOR_FLOW.staking,
      step: "stake_submit",
      context: {
        walletAddress: depositor,
        chainId: contracts.staker!.chain.id,
      },
      tags: ["staking", "frontend"],
      attributes: {
        action: "stake",
        amount: amountToStake.toString(),
        delegate,
      },
      startEventName: "staking_submit_started",
      startEventDetails: {
        amount: amountToStake.toString(),
        delegate,
      },
    });
    traceRef.current = trace;
    attachMiradorTransactionArtifacts(trace, {
      chainId: contracts.staker!.chain.id,
      inputData:
        "data" in config.request && typeof config.request.data === "string"
          ? config.request.data
          : undefined,
    });

    try {
      write(config.request);
    } catch (error) {
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "staking_submit_failed",
        eventName: "staking_submit_failed",
        details: {
          amount: amountToStake.toString(),
          delegate,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
    }
  };

  return (
    <div className="rounded-xl border border-line bg-wash w-[354px] p-4 shadow-newDefault">
      <div className="border border-line bg-neutral rounded-lg p-4">
        <div className="text-center text-xs text-secondary">
          Staking {token.symbol}
        </div>

        <div className="w-full text-center bg-neutral font-bold text-3xl text-primary">
          {formatNumber(numberToToken(amount).toString(), token.decimals)}{" "}
          {token.symbol}
        </div>
      </div>

      {!isSufficientSpendingAllowance ? (
        <PanelSetAllowance amount={amountToStake} />
      ) : (
        <>
          {isTransactionConfirmed ? (
            <div className="mt-4">
              <RedirectAfterSuccess
                message={"New stake confirmed successfully!"}
                linkTitle={"Return to staking page"}
                linkURI={`/staking/${depositor}`}
                refreshPath={refreshPath}
              />
            </div>
          ) : (
            <>
              <div className="text-sm py-4 text-primary">
                Please verify your transaction details before confirming.
              </div>

              <Button
                className="w-full"
                disabled={isLoading || !Boolean(config?.request)}
                onClick={handleStake}
              >
                {isLoading
                  ? "Staking..."
                  : `Stake & delegate my ${token.symbol}`}
              </Button>
            </>
          )}
          {data && <BlockScanUrls hash1={data} />}
        </>
      )}
    </div>
  );
};
