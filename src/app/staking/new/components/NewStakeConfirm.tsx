"use client";

import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { isAddress } from "viem";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { formatNumber, numberToToken } from "@/lib/utils";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { RedirectAfterSuccess } from "@/app/staking/components/RedirectAfterSuccess";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { PanelSetAllowance } from "@/app/staking/components/PanelSetAllowance";

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

  const isValidInput = Boolean(
    isSufficientSpendingAllowance && isAddress(delegate)
  );

  const { config, status, error } = usePrepareContractWrite({
    enabled: isSufficientSpendingAllowance,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stake",
    args: [amountToStake, delegate],
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
                {isLoading
                  ? "Staking..."
                  : `Stake & delegate my ${token.symbol}`}
              </Button>
            </>
          )}
          {data?.hash && <BlockScanUrls hash1={data?.hash} />}
        </>
      )}
    </div>
  );
};
