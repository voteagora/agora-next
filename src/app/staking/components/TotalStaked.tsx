"use client";


import { formatNumber } from "@/lib/utils";
import React from "react";
import { useTotalStaked } from "@/hooks/useTotalStaked";
import Tenant from "@/lib/tenant/tenant";


export const TotalStaked = () => {
  const { data: staked, isFetching } = useTotalStaked();
  const { token } = Tenant.current();


  if (!staked && isFetching) {
    return <div className="text-xs text-slate-600">Loading...</div>;
  }

  if (!staked) {
    return "No staking data available";
  }

  return <div className="rounded-lg border border-slate-300 w-full p-5 mb-4">
    <div className="text-center font-medium">
      {`${formatNumber(staked, token.decimals, token.decimals)} ${token.symbol}`}
    </div>
  </div>;


};
