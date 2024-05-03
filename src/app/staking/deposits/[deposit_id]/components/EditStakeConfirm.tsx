"use client";

import React, { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { formatNumber, numberToToken } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { StakedDeposit } from "@/lib/types";

interface EditStakeConfirmProps {
  amount: number;
  deposit: StakedDeposit;
}

export const EditStakeConfirm = ({
  amount,
  deposit,
}: EditStakeConfirmProps) => {
  const router = useRouter();
  const { token, contracts } = Tenant.current();
  const isValidInput = Boolean(amount > 0 && deposit);

  const { config } = usePrepareContractWrite({
    enabled: isValidInput,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stakeMore",
    args: [BigInt(deposit.id), numberToToken(amount)],
  });

  const { data, write, status } = useContractWrite(config);
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const isStakeConfirmed = Boolean(data?.hash && !isLoading);

  useEffect(() => {
    if (data?.hash && !isLoading) {
      setTimeout(() => {
        router.replace("/staking");
      }, 3000);
    }
  }, [isLoading, data?.hash]);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4 shadow-newDefault">
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="text-center text-xs text-gray-600">
          Adding {token.symbol} to existing stake
        </div>

        <div className="w-full text-center bg-white font-bold text-3xl text-black">
          {formatNumber(numberToToken(amount).toString(), token.decimals)}{" "}
          {token.symbol}
        </div>
      </div>
      <div className="text-sm py-4">
        Please verify your transaction details before confirming.
      </div>

      {isStakeConfirmed ? (
        <Button className="w-full" disabled={true}>
          Confirming onchain transaction...
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={!isValidInput || isLoading}
          onClick={() => {
            write?.();
          }}
        >
          {isLoading ? "Staking..." : `Update Stake`}
        </Button>
      )}
    </div>
  );
};
