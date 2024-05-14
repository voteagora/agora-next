"use client";

import React, { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import { isAddress } from "viem";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { formatNumber, numberToToken } from "@/lib/utils";
import { useRouter } from "next/navigation";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

interface NewStakeConfirmProps {
  amount: number;
  delegate: string;
  depositor: string;
}

export const NewStakeConfirm = ({ amount, delegate, depositor }: NewStakeConfirmProps) => {
  const router = useRouter();
  const { token, contracts } = Tenant.current();
  const isValidInput = Boolean(amount > 0 && delegate && isAddress(delegate));

  const { config, status, error } = usePrepareContractWrite({
    enabled: isValidInput,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stake",
    args: [numberToToken(amount), delegate as `0x${string}`],
  });

  const { data, write } = useContractWrite(config);
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const isStakeConfirmed = Boolean(data?.hash && !isLoading);

  useEffect(() => {
    if (data?.hash && !isLoading) {

      setTimeout(() => {
        router.replace(`/staking/${depositor}`);
      }, 3000);

    }
  }, [isLoading, data?.hash]);

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
            {isLoading ? "Staking..." : `Stake & delegate my ${token.symbol}`}
          </Button>
          {data?.hash && <BlockScanUrls hash1={data?.hash} />}
        </>
      )}
    </div>
  );
};
