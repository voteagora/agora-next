"use client";

import { Button } from "@/components/ui/button";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";


interface UnstakeButtonProps {
  id: BigInt;
  amount: BigInt;
}

export const UnstakeButton = ({ amount, id }: UnstakeButtonProps) => {

  const { contracts, token } = Tenant.current();

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


  const { write, status } = useContractWrite(config);

  return <Button className="w-full" onClick={() => {
    if (write) write();
  }}>Unstake</Button>;
};



