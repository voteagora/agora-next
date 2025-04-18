"use client";

import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import {
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { TOKEN_ALLOWANCE_QK } from "@/hooks/useTokenAllowance";
import { useQueryClient } from "@tanstack/react-query";

interface PanelSetAllowanceProps {
  amount: bigint;
}

export const PanelSetAllowance = ({ amount }: PanelSetAllowanceProps) => {
  const queryClient = useQueryClient();
  const { contracts, token } = Tenant.current();

  const { data: config } = useSimulateContract({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    chainId: contracts.token.chain.id,
    functionName: "approve",
    args: [contracts.staker!.address, amount],
  });

  const { data, writeContract: write } = useWriteContract();
  const { isLoading, isFetched: didUpdateAllowance } =
    useWaitForTransactionReceipt({
      hash: data,
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
      <div className="text-sm py-4 text-primary">
        Please allow your {token.symbol} tokens to be used for staking.
      </div>

      <Button
        className="w-full"
        disabled={isLoading || !Boolean(config?.request)}
        onClick={() => write(config!.request)}
      >
        {isLoading ? "Updating..." : "Update Allowance"}
      </Button>
    </>
  );
};
