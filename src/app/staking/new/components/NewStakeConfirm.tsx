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
  const { data: maxBalance, isFetched: isLoadedMaxBalance } = useTokenBalance(
    depositor as `0x${string}`
  );

  const isValidInput = Boolean(
    amount > 0 && delegate && isAddress(delegate) && isLoadedMaxBalance
  );

  // There are cases where the amount might be higher than the balance of available tokes due to artifacts of
  // number to BigInt conversion. In such cases, we need to ensure that the amount to stake is capped at the maximum.
  const amountToStake =
    maxBalance && numberToToken(amount) > maxBalance
      ? maxBalance
      : numberToToken(amount);

  const { config, status, error } = usePrepareContractWrite({
    enabled: isValidInput,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stake",
    args: [amountToStake, delegate as `0x${string}`],
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

        <div className="w-full text-center bg-white font-bold text-3xl text-black">
          {formatNumber(numberToToken(amount).toString(), token.decimals)}{" "}
          {token.symbol}
        </div>
      </div>

      {status === "error" ? (
        <div className="py-4">
          <div className="font-semibold text-red-500 mb-2">
            Unable to process current transaction
          </div>
          <div className="text-xs text-red-500">
            {(error as any)?.cause?.reason}
          </div>
        </div>
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
                disabled={!isValidInput || isLoading}
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
