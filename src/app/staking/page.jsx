import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { Deposits } from "@/app/staking/components/Deposits";
import { PoolStats } from "@/app/staking/components/PoolStats";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";
import { HStack } from "@/components/Layout/Stack";
import { ClaimRewards } from "./components/ClaimRewards";
import FAQs from "@/components/Staking/FAQs";

export default async function Page() {

  const { token, contracts, ui } = Tenant.current();
  const [totalSupply, rewardPerToken, rewardDuration] = await Promise.all([
    contracts.token.contract.totalSupply(),
    contracts.staker.contract.rewardPerTokenAccumulated(),
    contracts.staker.contract.REWARD_DURATION(),
  ]);

  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <Deposits
          fetchStaked={async (address) => {
            "use server";
            return apiFetchStakedDeposits({ address });
          }}
        />

        <div className="mt-10">
          <div className="font-black text-2xl mb-5">
            {token.symbol} Staking Metrics
          </div>
          <PoolStats
            rewardDuration={rewardDuration}
            rewardPerToken={rewardPerToken}
            totalSupply={totalSupply}
          />
        </div>
        <FAQs />
      </div>
      <div className="sm:col-start-5">
        <h2 className="font-black text-2xl text-black">Your rewards</h2>
        <ClaimRewards />
      </div>
    </HStack>
  );
}