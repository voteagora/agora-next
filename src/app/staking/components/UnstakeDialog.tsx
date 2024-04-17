"use client";

import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
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

  const start = 6;
  const end = 35;
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
    <div className="rounded-lg border border-slate-300 w-[400px] p-5">
      <div className="text-center mb-2 text-xs text-slate-600">
        {hasTotalStaked && (
          <TokenAmountDisplay
            maximumSignificantDigits={5}
            amount={totalStaked}
          />
        )}
      </div>

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
