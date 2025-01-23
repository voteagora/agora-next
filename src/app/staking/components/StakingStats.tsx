"use client";

import React from "react";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { useTotalSupply } from "@/hooks/useTotalSupply";
import { useTotalStaked } from "@/hooks/useTotalStaked";
import { useRewardPerToken } from "@/hooks/useRewardPerToken";
import { useRewardDuration } from "@/hooks/useRewardDuration";

export const StakingStats = async () => {
  const { data: totalSupply } = useTotalSupply({ enabled: true });
  const { data: totalStaked } = useTotalStaked({ enabled: true });
  const { data: rewardPerToken } = useRewardPerToken({ enabled: true });
  const { data: rewardDuration } = useRewardDuration({ enabled: true });

  return (
    <div className="flex justify-evenly rounded-xl border border-line w-auto h-100 mb-4 bg-wash">
      <div className="flex flex-col text-center p-5">
        <div className="text-xs text-secondary">Total Supply</div>
        <div className="font-medium text-primary">
          <TokenAmountDisplay amount={totalSupply || 0n} />
        </div>
      </div>

      <div className="border-r border-line"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs text-secondary">Total Staked</div>
        <div className="font-medium text-primary">
          <TokenAmountDisplay amount={totalStaked || 0n} />
        </div>
      </div>

      <div className="border-r border-line"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs text-secondary">Rewards per token</div>
        <div className="font-medium text-primary">
          <TokenAmountDisplay amount={rewardPerToken || 0n} currency={"WETH"} />
        </div>
      </div>

      <div className="border-r border-line"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs text-secondary">Rewards Duration</div>
        <div className="font-medium text-primary">
          {rewardDuration
            ? `Every ${Number(rewardDuration.toString()) / 86400} days}`
            : "Undefined"}
        </div>
      </div>
    </div>
  );
};
