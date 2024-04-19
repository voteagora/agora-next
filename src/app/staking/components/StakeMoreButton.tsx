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

export const StakeMoreButton = ({
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
    abi: [
      {
        inputs: [
          {
            internalType: "UniStaker.DepositIdentifier",
            name: "_depositId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
        ],
        name: "stakeMore",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    chainId: contracts?.staker?.chain.id,
    functionName: "stakeMore",
    args: [BigInt(depositId), BigInt(amount)],
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
        queryKey: ["stakedDeposit", { id: depositId }],
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
      {isLoading ? "Staking..." : "Stake More"}
    </Button>
  );
};
