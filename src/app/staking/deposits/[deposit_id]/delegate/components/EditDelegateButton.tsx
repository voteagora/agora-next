import { StakedDeposit } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface EditDelegateButtonProps {
  delegate: string;
  deposit: StakedDeposit;
  onConfirmed: () => void;
}

export const EditDelegateButton = ({
  delegate,
  deposit,
  onConfirmed,
}: EditDelegateButtonProps) => {
  const { contracts } = Tenant.current();

  const { config } = usePrepareContractWrite({
    enabled: !!delegate,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "alterDelegatee",
    args: [BigInt(deposit.id), delegate as `0x${string}`],
  });

  const { data, write, status } = useContractWrite(config);
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash && !isLoading) {
      onConfirmed();
    }
  }, [isLoading, data?.hash]);

  return (
    <Button
      className="w-full"
      disabled={!!delegate && isLoading}
      onClick={() => {
        write?.();
      }}
    >
      {isLoading ? "Updating..." : `Update Delegate`}
    </Button>
  );
};
