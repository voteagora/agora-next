"use client";

import { Button } from "@/components/ui/button";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface DepositWithdrawButtonProps {
  id: bigint;
  amount: bigint;
  onSuccess: () => void;
}

export const DepositWithdrawButton = ({
  amount,
  id,
  onSuccess,
}: DepositWithdrawButtonProps) => {
  const { contracts, token } = Tenant.current();
  const queryClient = useQueryClient();
  const isValidAmount = amount > 0n;

  const { config } = usePrepareContractWrite({
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "withdraw",
    args: [id, amount],
  });

  const { data, write, status } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash && !isLoading) {
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      queryClient.invalidateQueries({ queryKey: ["totalStaked"] });
      queryClient.invalidateQueries({
        queryKey: ["stakedDeposit", { id: id }],
      });
      // onSuccess();
    }
  }, [isLoading, data?.hash, onSuccess, queryClient]);

  return (
    <Button
      className="w-full"
      disabled={isLoading || !isValidAmount}
      onClick={() => write?.()}
    >
      {isLoading ? "Withdrawing..." : "Withdraw"}
    </Button>
  );
};
