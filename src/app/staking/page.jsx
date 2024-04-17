import { StakeDialog } from "@/app/staking/components/StakeDialog";
import { UnstakeDialog } from "@/app/staking/components/UnstakeDialog";
import { PoolStats } from "@/app/staking/components/PoolStats";
import Hero from "@/components/Hero/Hero";
import React from "react";
import { apiFetchTotalStaked } from "@/app/api/common/staking/getTotalStaked";
import { apiFetchTotalSupply } from "@/app/api/common/token/getTotalSupply";
import { apiFetchRewardPerTokenAccumulated } from "@/app/api/common/staking/getRewardPerTokenAccumulated";
import { apiFetchRewardEndTime } from "@/app/api/common/staking/getRewardEndTime";
import Tenant from "@/lib/tenant/tenant";


async function fetchTotalStaked() {
  "use server";
  return apiFetchTotalStaked();
}

async function fetchTotalSupply() {
  "use server";
  return apiFetchTotalSupply();
}

async function fetchRewardPerToken() {
  "use server";
  return apiFetchRewardPerTokenAccumulated();
}

async function fetchRewardEndTime() {
  "use server";
  return apiFetchRewardEndTime();

}


export default async function Page() {

  const { token } = Tenant.current();

  const totalStaked = await fetchTotalStaked();
  const totalSupply = await fetchTotalSupply();
  const rewardPerToken = await fetchRewardPerToken();
  const rewardEndTime = await fetchRewardEndTime();

  return (
    <section>
      <Hero />

      <div className="font-black text-2xl mb-4">{token.symbol} Staking Metrics</div>
      <PoolStats
        rewardEndTime={rewardEndTime}
        rewardPerToken={rewardPerToken}
        totalStaked={totalStaked}
        totalSupply={totalSupply}
      />

      <div className="flex gap-5 columns-3">
        <StakeDialog />
        <UnstakeDialog />
      </div>
    </section>
  );
}
