import { Deposits } from "@/app/staking/components/Deposits";
import { PoolStats } from "@/app/staking/components/PoolStats";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";

export default async function Page() {
  const { token, contracts } = Tenant.current();

  const [totalSupply, rewardPerToken, rewardDuration] = await Promise.all([
    contracts.token.contract.totalSupply(),
    contracts.staker.contract.rewardPerTokenAccumulated(),
    contracts.staker.contract.REWARD_DURATION(),
  ]);

  return (
    <section>
      <Deposits
        fetchStaked={async (address) => {
          "use server";
          return apiFetchStakedDeposits({ address });
        }}
      />

      <div className="font-black text-2xl mb-4">
        {token.symbol} Staking Metrics
      </div>

      <PoolStats
        rewardDuration={rewardDuration}
        rewardPerToken={rewardPerToken}
        totalSupply={totalSupply}
      />
    </section>
  );
}
