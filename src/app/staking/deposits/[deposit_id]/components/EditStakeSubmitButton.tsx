import { StakedDeposit } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { numberToToken } from "@/lib/utils";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface EditStakeSubmitButtonProps {
  amount: number;
  deposit: StakedDeposit;
  onConfirmed: () => void;
}

export const EditStakeSubmitButton = ({
  amount,
  deposit,
  onConfirmed,
}: EditStakeSubmitButtonProps) => {
  const { contracts } = Tenant.current();
  const isValidInput = Boolean(amount > 0 && deposit);

  const { config } = usePrepareContractWrite({
    enabled: isValidInput,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "stakeMore",
    args: [BigInt(deposit.id), numberToToken(amount)],
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
      disabled={!isValidInput || isLoading}
      onClick={() => {
        write?.();
      }}
    >
      {isLoading ? "Staking..." : `Update Stake`}
    </Button>
  );
};
