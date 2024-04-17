"use client";


import { formatNumber } from "@/lib/utils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { BigNumberish } from "ethers";

interface PoolStatsProps {
  totalStaked: BigNumberish;
  totalSupply: BigNumberish;
}

export const PoolStats = async ({ totalStaked, totalSupply }: PoolStatsProps) => {

  const { contracts } = Tenant.current();

  const { token } = Tenant.current();

  return <div className="rounded-lg border border-slate-300 w-auto p-5 mb-4">
    <div className="text-center font-medium">
      {`${formatNumber(totalStaked, token.decimals)} ${token.symbol}`}
    </div>
    <div className="text-center font-medium">
      {`${formatNumber(totalSupply, token.decimals)} ${token.symbol}`}
    </div>
  </div>;


};
