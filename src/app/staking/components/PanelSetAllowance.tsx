"use client";

import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { TOKEN_ALLOWANCE_QK } from "@/hooks/useTokenAllowance";
import { useQueryClient } from "@tanstack/react-query";

interface PanelSetAllowanceProps {
  amount: bigint;
}

export const PanelSetAllowance = ({ amount }: PanelSetAllowanceProps) => {
  const queryClient = useQueryClient();
  const { contracts, token } = Tenant.current();

  const { config } = usePrepareContractWrite({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    chainId: contracts.token.chain.id,
    functionName: "approve",
    args: [contracts.staker!.address, amount],
  });

  const { data, write } = useContractWrite(config);
  const { isLoading, isFetched: didUpdateAllowance } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (didUpdateAllowance) {
      // Invalidate the token allowance query
      queryClient.invalidateQueries({
        queryKey: [TOKEN_ALLOWANCE_QK],
      });
    }
  }, [didUpdateAllowance, queryClient]);

  return (
    <>
      <div className="text-sm py-4">
        Please allow your {token.symbol} tokens to be used for staking.
      </div>

      <Button className="w-full" disabled={isLoading} onClick={() => write?.()}>
        {isLoading ? "Updating..." : "Update Allowance"}
      </Button>
    </>
  );
};
