"use client";

import { formatNumber } from "@/lib/utils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { BigNumberish } from "ethers";
import { useTotalStaked } from "@/hooks/useTotalStaked";

interface PoolStatsProps {
  rewardDuration: string;
  rewardPerToken: BigNumberish;
  totalSupply: BigNumberish;
}

export const PoolStats = async ({
  rewardPerToken,
  totalSupply,
  rewardDuration,
}: PoolStatsProps) => {
  const { token, contracts } = Tenant.current();
  const { data } = useTotalStaked();
  const totalStaked = data ?? BigInt(0);

  return (
    <div className="flex justify-evenly rounded-lg border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Total Supply</div>
        <div className="font-medium">{`${formatNumber(
          totalSupply,
          token.decimals
        )} ${token.symbol}`}</div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Total Staked</div>
        <div className="font-medium">{`${formatNumber(
          totalStaked,
          token.decimals
        )} ${token.symbol}`}</div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col text-center p-5">
        <div className="text-xs">Rewards per token</div>
        <div className="font-medium">{`${formatNumber(
          rewardPerToken,
          token.decimals
        )} WETH`}</div>
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
