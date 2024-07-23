"use client";

import React from "react";
import Tenant from "@/lib/tenant/tenant";

import { formatNumber, numberToToken } from "@/lib/utils";
import { StakedDeposit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { RedirectAfterSuccess } from "@/app/staking/components/RedirectAfterSuccess";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { isAddress } from "viem";
import { PanelSetAllowance } from "@/app/staking/components/PanelSetAllowance";

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

  // Check if a user has allowed the staking contract to spend their tokens
  const { data: allowance, isFetched: isLoadedAllowance } = useTokenAllowance(
    deposit.depositor
  );
  const hasAllowance = isLoadedAllowance && allowance !== undefined;

  const { data: maxBalance, isFetched: isLoadedMaxBalance } = useTokenBalance(
    deposit.depositor
  );

  // There are cases where the amount might be higher than the balance of available tokes due to artifacts of
  // number to BigInt conversion. In such cases, we need to ensure that the amount to stake is capped at the maximum.
  const amountToAdd =
    maxBalance && numberToToken(amount) > maxBalance
      ? maxBalance
      : numberToToken(amount);

  const isSufficientSpendingAllowance =
    hasAllowance && allowance >= amountToAdd;

  const { config, status, error } = usePrepareContractWrite({
    enabled: isSufficientSpendingAllowance,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stakeMore",
    args: [BigInt(deposit.id), amountToAdd],
  });

  const { data, write } = useContractWrite(config);
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const isTransactionConfirmed = Boolean(data?.hash && !isLoading);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4 shadow-newDefault">
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="text-center text-xs text-gray-600">
          Adding {token.symbol} to existing stake
        </div>

        <div className="w-full text-center bg-neutral font-bold text-3xl text-primary">
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
              <div className="text-sm py-4">
                Please verify your transaction details before confirming.
              </div>
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={() => {
                  write?.();
                }}
              >
                {isLoading ? "Staking..." : `Update Stake`}
              </Button>
            </>
          )}
          {data?.hash && <BlockScanUrls hash1={data?.hash} />}
        </>
      )}
    </div>
  );
};
