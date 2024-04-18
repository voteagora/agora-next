import { StakeDialog } from "@/app/staking/components/StakeDialog";
import { UnstakeDialog } from "@/app/staking/components/UnstakeDialog";
import { PoolStats } from "@/app/staking/components/PoolStats";
import Hero from "@/components/Hero/Hero";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { ClaimRewards } from "@/app/staking/components/ClaimRewards";

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
        <StakeDialog />
        <StakeDialog delegate={"0x1d671d1B191323A38490972D58354971E5c1cd2A"} />
        <UnstakeDialog />
      </div>
    </section>
  );
}
