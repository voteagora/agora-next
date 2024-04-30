import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { Deposits } from "@/app/staking/components/Deposits";
import { PoolStats } from "@/app/staking/components/PoolStats";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";
import { HStack } from "@/components/Layout/Stack";
import { ClaimRewards } from "./components/ClaimRewards";
import FAQs from "@/components/Staking/FAQs";
import StartUniStackCard from "@/components/Staking/StartUniStackCard";

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
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 font-inter mt-12">
      <div className="sm:col-span-4">
        <Deposits
          fetchStaked={async (address) => {
            "use server";
            return apiFetchStakedDeposits({ address });
          }}
        />

        <div className="font-black text-2xl mb-4 mt-8">
          {token.symbol} Staking Metrics
        </div>

        <PoolStats
          rewardDuration={rewardDuration}
          rewardPerToken={rewardPerToken}
          totalSupply={totalSupply}
        />
        <FAQs />
      </div>
      <div className="sm:col-start-5">
        {/*these cards will be shown on the basis of first deposit and collect reward basis */}
        {true ? (
          <StartUniStackCard />
        ) : (
          <>
            <h2 className="font-black text-2xl text-black">Your rewards</h2>
            <ClaimRewards />
          </>
        )}
      </div>
    </HStack>
  );
}
