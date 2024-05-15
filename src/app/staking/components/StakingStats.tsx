import React from "react";
import { BigNumberish } from "ethers";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

interface StakingStatsProps {
  rewardDuration: string;
  rewardPerToken: BigNumberish;
  totalStaked: BigNumberish;
  totalSupply: BigNumberish;
}

export const StakingStats = ({
  rewardDuration,
  rewardPerToken,
  totalStaked,
  totalSupply,
}: StakingStatsProps) => {
  return (
    <div className="flex justify-evenly rounded-xl border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Total Supply</div>
        <div className="font-medium">
          <TokenAmountDisplay amount={totalSupply} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Total Staked</div>
        <div className="font-medium">
          <TokenAmountDisplay amount={totalStaked} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Rewards per token</div>
        <div className="font-medium">
          <TokenAmountDisplay amount={rewardPerToken} currency={"WETH"} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Rewards Duration</div>
        <div className="font-medium">
          Every {Number(rewardDuration.toString()) / 86400} days
        </div>
      </div>
    </div>
  );
};
