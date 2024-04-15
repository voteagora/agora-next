"use client";

import { Button } from "@/components/ui/button";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";


interface StakeButtonProps {
  address: string;
  amount: number;
}

export const StakeButton = ({ address, amount }: StakeButtonProps) => {

  const { contracts, token } = Tenant.current();

  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    enabled: !!address,
    address: contracts.staker!.address as `0x${string}`,
    abi: [
      {
        name: "stake",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
          {
            internalType: "address",
            name: "_delegatee",
            type: "address",
          }],
        outputs: [{
          internalType: "UniStaker.DepositIdentifier",
          name: "_depositId",
          type: "uint256",
        }],
      },
    ],
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

  return <Button className="w-full" disabled={isLoading}
                 onClick={() => write?.()}>{isLoading ? "Staking..." : "Stake"}</Button>;
};



