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

interface StakeMoreButtonProps {
  amount: number;
  depositId: number;
  onSuccess: () => void;
}

export const DepositAddButton = ({
  amount,
  depositId,
  onSuccess,
}: StakeMoreButtonProps) => {
  const { contracts, token } = Tenant.current();
  const queryClient = useQueryClient();
  const isValidAmount = amount > 0;

  const { config } = usePrepareContractWrite({
    enabled: isValidAmount,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts?.staker?.chain.id,
    functionName: "stakeMore",
    args: [depositId, BigInt(amount)],
  });

  const { data, write, status } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash && !isLoading) {
      // TODO: Figure out why invalidating multiple queries didn't work
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      queryClient.invalidateQueries({ queryKey: ["totalStaked"] });
      onSuccess();
    }
  }, [isLoading, data?.hash, onSuccess, queryClient]);

  return (
    <Button
      className="w-full"
      disabled={isLoading || !isValidAmount}
      onClick={() => write?.()}
    >
      {isLoading ? "Staking..." : "Stake More"}
    </Button>
  );
};
