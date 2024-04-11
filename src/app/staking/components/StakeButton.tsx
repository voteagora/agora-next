"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

export const StakeButton = async () => {

  const { contracts, token } = Tenant.current();

  const { address } = useAccount();
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
    args: [BigInt(1), address as `0x${string}`],
  });

  const { write, status } = useContractWrite(config);

  return <Button onClick={() => { if (write) write(); }}>Stake 10 UNI</Button>;
};