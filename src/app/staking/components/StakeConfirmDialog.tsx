"use client";

import React, { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useQueryClient } from "@tanstack/react-query";
import { isAddress } from "viem";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { formatNumber, numberToToken } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SetStakeDialogProps {
  amount: number;
  address: string;
}

export const StakeConfirmDialog = ({
                                     amount,
                                     address,
                                   }: SetStakeDialogProps) => {
  const router = useRouter();
  const { token, contracts } = Tenant.current();
  const queryClient = useQueryClient();
  const isValidInput = Boolean(amount > 0 && address && isAddress(address));

  const { config } = usePrepareContractWrite({
    enabled: isValidInput,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stake",
    args: [
      numberToToken(amount),
      address as `0x${string}`,
    ],
  });

  const { data, write, status } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash && !isLoading) {
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      queryClient.invalidateQueries({ queryKey: ["totalStaked"] });
      router.replace("/staking", { scroll: false });
    }
  }, [isLoading, data?.hash]);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4 shadow-newDefault">
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="text-center text-xs text-gray-600">
          Staking {token.symbol}
        </div>

        <div className="w-full text-center bg-white font-bold text-3xl text-black">
          {formatNumber(numberToToken(amount).toString(), token.decimals)} {token.symbol}
        </div>
      </div>
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
    </div>
  );
};
