"use client";

import React, { useEffect, useRef } from "react";
import Tenant from "@/lib/tenant/tenant";

import { formatNumber, numberToToken } from "@/lib/utils";
import { StakedDeposit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import {
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { RedirectAfterSuccess } from "@/app/staking/components/RedirectAfterSuccess";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { PanelSetAllowance } from "@/app/staking/components/PanelSetAllowance";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface EditDepositConfirmProps {
  amount: number;
  deposit: StakedDeposit;
  refreshPath: (path: string) => void;
}

export const EditDepositConfirm = ({
  amount,
  deposit,
  refreshPath,
}: EditDepositConfirmProps) => {
  const { token, contracts } = Tenant.current();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  // Check if a user has allowed the staking contract to spend their tokens
  const { data: allowance, isFetched: isLoadedAllowance } = useTokenAllowance(
    deposit.depositor
  );
  const hasAllowance = isLoadedAllowance && allowance !== undefined;

  const { data: maxBalance } = useTokenBalance(deposit.depositor);

  // There are cases where the amount might be higher than the balance of available tokes due to artifacts of
  // number to BigInt conversion. In such cases, we need to ensure that the amount to stake is capped at the maximum.
  const amountToAdd =
    maxBalance && numberToToken(amount) > maxBalance
      ? maxBalance
      : numberToToken(amount);

  const isSufficientSpendingAllowance =
    hasAllowance && allowance >= amountToAdd;

  const { data: config } = useSimulateContract({
    query: { enabled: isSufficientSpendingAllowance },
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stakeMore",
    args: [BigInt(deposit.id), amountToAdd],
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
        txDetails: "Stake more transaction",
      });
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_succeeded",
        eventName: "staking_submit_succeeded",
        details: {
          action: "stake_more",
          amount: amountToAdd.toString(),
          depositId: deposit.id,
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
          action: "stake_more",
          amount: amountToAdd.toString(),
          depositId: deposit.id,
        },
      });
      traceRef.current = null;
    }
  }, [
    amountToAdd,
    config?.request,
    contracts.staker,
    data,
    deposit.id,
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
          action: "stake_more",
          amount: amountToAdd.toString(),
          depositId: deposit.id,
        },
      });
      traceRef.current = null;
    };
  }, [amountToAdd, deposit.id]);

  const handleStakeMore = () => {
    if (!config?.request) {
      return;
    }

    if (traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_restarted",
        eventName: "staking_submit_restarted",
        details: {
          action: "stake_more",
          amount: amountToAdd.toString(),
          depositId: deposit.id,
        },
      });
    }

    const trace = startFrontendMiradorFlowTrace({
      name: "StakingAction",
      flow: MIRADOR_FLOW.staking,
      step: "stake_more_submit",
      context: {
        walletAddress: deposit.depositor,
        chainId: contracts.staker!.chain.id,
      },
      tags: ["staking", "frontend"],
      attributes: {
        action: "stake_more",
        amount: amountToAdd.toString(),
        depositId: deposit.id,
      },
      startEventName: "staking_submit_started",
      startEventDetails: {
        action: "stake_more",
        amount: amountToAdd.toString(),
        depositId: deposit.id,
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
          action: "stake_more",
          amount: amountToAdd.toString(),
          depositId: deposit.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
    }
  };

  return (
    <div className="rounded-xl bg-wash border border-line w-[354px] p-4 shadow-newDefault">
      <div className="border border-line bg-neutral rounded-lg p-4">
        <div className="text-center text-xs text-secondary">
          Adding {token.symbol} to existing stake
        </div>

        <div className="w-full text-center font-bold text-3xl text-primary">
          {formatNumber(numberToToken(amount).toString(), token.decimals)}{" "}
          {token.symbol}
        </div>
      </div>

      {!isSufficientSpendingAllowance ? (
        <PanelSetAllowance amount={amountToAdd} />
      ) : (
        <>
          {isTransactionConfirmed ? (
            <div className="mt-4">
              <RedirectAfterSuccess
                message={"Stake amount updated successfully!"}
                linkTitle={"Return to staking page"}
                linkURI={`/staking/${deposit.depositor}`}
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
                onClick={handleStakeMore}
              >
                {isLoading ? "Staking..." : `Update Stake`}
              </Button>
            </>
          )}
          {data && <BlockScanUrls hash1={data} />}
        </>
      )}
    </div>
  );
};
