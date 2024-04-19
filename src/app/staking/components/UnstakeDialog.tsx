"use client";

import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import { Button } from "@/components/ui/button";
import { StakedDeposit } from "@/app/staking/components/StakedDeposit";

export const UnstakeDialog = () => {
  const { token } = Tenant.current();
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const { data: totalStaked, isFetched: isLoadedTotalStaked } =
    useDepositorTotalStaked(address as `0x${string}`);
  const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined;

  const start = 16;
  const end = 40;
  const depositIds = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );

  if (!isConnected || !address) {
    return (
      <Button disabled={true}>Connect Wallet to Stake ${token.symbol}</Button>
    );
  }

  return (
    <div>
      {!hasTotalStaked && (
        <div className="text-xs text-slate-600 py-4">
          No deposits found for this wallet
        </div>
      )}

      {depositIds.map((depositId) => {
        return <StakedDeposit id={depositId} key={`deposit-${depositId}`} />;
      })}
    </div>
  );
};
