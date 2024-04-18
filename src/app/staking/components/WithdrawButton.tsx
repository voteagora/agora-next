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

interface WithdrawButtonProps {
  id: BigInt;
  amount: BigInt;
}

export const WithdrawButton = ({ amount, id }: WithdrawButtonProps) => {
  const { contracts, token } = Tenant.current();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
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
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
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
      queryClient.invalidateQueries({ queryKey: ["stakedDeposit"] });
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      queryClient.invalidateQueries({ queryKey: ["totalStaked"] });
    }
  }, [isLoading, data?.hash]);

  return (
    <Button
      variant="outline"
      disabled={isLoading}
      onClick={() => {
        if (write) write();
      }}
    >
      {isLoading ? "Unstaking..." : "Withdraw "}
    </Button>
  );
};
