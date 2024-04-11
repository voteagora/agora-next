"use client";

import { Button } from "@/components/ui/button";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";


interface StakeButtonProps {
  address: string;
  amount: number;
}

export const StakeButton = ({ address, amount }: StakeButtonProps) => {

  const { contracts, token } = Tenant.current();

  const { config } = usePrepareContractWrite({
    address: contracts?.staker?.address as `0x${string}`,
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


  const { write, status } = useContractWrite(config);

  return <Button className="w-full" onClick={() => {
    if (write) write();
  }}>Continue</Button>;
};



