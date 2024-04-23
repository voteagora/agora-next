import { StakeAndDelegate } from "@/app/staking/components/StakeAndDelegate";
import { Deposits } from "@/app/staking/components/Deposits";
import { PoolStats } from "@/app/staking/components/PoolStats";
import Hero from "@/components/Hero/Hero";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { ClaimRewards } from "@/app/staking/components/ClaimRewards";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";

async function fetchStakedDeposits(address) {
  "use server";
  return {
    deposits: await apiFetchStakedDeposits({ address }),
  };
}

export default async function Page() {

  const { token } = Tenant.current();

  return (
    <section>
      <Hero />

      <div className="font-black text-2xl mb-4">
        {token.symbol} Staking Metrics
      </div>
      <PoolStats
        rewardEndTime={0}
        rewardPerToken={0}
        totalStaked={0}
        totalSupply={0}
      />

      <div className="font-black text-2xl mb-4">Your Rewards</div>

      <ClaimRewards />

      <div className="flex gap-5 columns-3">
        <StakeAndDelegate />

        <Deposits />
      </div>
    </section>
  );
}
