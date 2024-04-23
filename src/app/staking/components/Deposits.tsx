"use client";

import React, { Suspense } from "react";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import { StakedDepositList } from "@/app/staking/components/StakedDepositList";

export const Deposits = () => {
    const { isConnected } = useAgoraContext();
    const { address } = useAccount();

    const { data: totalStaked, isFetched: isLoadedTotalStaked } = useDepositorTotalStaked(address as `0x${string}`);
    const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined && totalStaked > 0;

    if (!isConnected || !address) {
      return <div>Connect wallet to conitnue</div>;
    }

    if (!hasTotalStaked) {
      return <div className="text-xs text-slate-600 py-4">
        No deposits found for this wallet
      </div>;
    }

    return <StakedDepositList address={address} />
  }
;
