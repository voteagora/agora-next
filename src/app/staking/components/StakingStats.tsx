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

  console.log(rewardDuration);

  return (
    <div className="flex justify-evenly rounded-xl border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Total Supply</div>
        <div className="font-medium">
          <TokenAmountDisplay amount={totalSupply || 0n} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Total Staked</div>
        <div className="font-medium">
          <TokenAmountDisplay amount={totalStaked || 0n} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Rewards per token</div>
        <div className="font-medium">
          <TokenAmountDisplay amount={rewardPerToken || 0n} currency={"WETH"} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Rewards Duration</div>
        <div className="font-medium">
          {rewardDuration
            ? `Every ${Number(rewardDuration.toString()) / 86400} days}`
            : "Undefined"}
        </div>
      </div>
    </div>
  );
};
