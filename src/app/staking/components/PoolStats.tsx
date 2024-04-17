"use server"

import { formatNumber } from "@/lib/utils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { BigNumberish } from "ethers";

interface PoolStatsProps {
  rewardEndTime: BigNumberish;
  rewardPerToken: BigNumberish;
  totalStaked: BigNumberish;
  totalSupply: BigNumberish;
}

export const PoolStats = async ({ totalStaked, totalSupply, rewardPerToken, rewardEndTime }: PoolStatsProps) => {

  const { token } = Tenant.current();

  return <div className="flex justify-evenly rounded-lg border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
    <div className="flex flex-col text-center p-5">
      <div className="text-xs">Supply</div>
      <div className="font-medium">{`${formatNumber(totalSupply, token.decimals)} ${token.symbol}`}</div>
    </div>

    <div className="border-r border-gray-300"></div>

    <div className="flex flex-col text-center p-5">
      <div className="text-xs">Staked</div>
      <div className="font-medium">{`${formatNumber(totalStaked, token.decimals)} ${token.symbol}`}</div>
    </div>

    <div className="border-r border-gray-300"></div>

    <div className="flex flex-col text-center p-5">
      <div className="text-xs">Rewards per Token</div>
      <div className="font-medium">{`${formatNumber(rewardPerToken, token.decimals)} ${token.symbol}`}</div>
    </div>

    <div className="border-r border-gray-300"></div>

    <div className="flex flex-col text-center p-5">
      <div className="text-xs">Next Reward</div>
      <div className="font-medium">{rewardEndTime.toString()}</div>
    </div>
  </div>;
};
