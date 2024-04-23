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
import { isAddress } from "viem";

interface StakeButtonProps {
  address?: string;
  amount: number;
}

export const StakeButton = ({ address, amount }: StakeButtonProps) => {
  const { contracts, token } = Tenant.current();
  const queryClient = useQueryClient();

  const isValidInput = Boolean(amount > 0 && address && isAddress(address));

  const { config } = usePrepareContractWrite({
    enabled: isValidInput,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi.abi,
    chainId: contracts?.staker?.chain.id,
    functionName: "stake",
    args: [BigInt(amount), address as `0x${string}`],
  });

  const { data, write, status } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash && !isLoading) {
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      queryClient.invalidateQueries({ queryKey: ["totalStaked"] });
    }
  }, [isLoading, data?.hash]);

  return (
    <Button
      className="w-full"
      disabled={!isValidInput || isLoading}
      onClick={() => write?.()}
    >
      {isLoading ? "Staking..." : "Stake and Delegate"}
    </Button>
  );
};
