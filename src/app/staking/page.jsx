import { HStack } from "@/components/Layout/Stack";
import React from "react";
import { StakingStats } from "@/app/staking/components/StakingStats";
import Tenant from "@/lib/tenant/tenant";
import { RedirectOrConnect } from "@/app/staking/components/RedirectOrConnect";
import FAQs from "@/app/staking/components/FAQs";
import { PanelNewDeposit } from "@/app/staking/components/PanelNewDeposit";

export default async function Page() {
  const { token, contracts } = Tenant.current();
  const [totalSupply, totalStaked, rewardPerToken, rewardDuration] =
    await Promise.all([
      contracts.token.contract.totalSupply(),
      contracts.staker.contract.totalStaked(),
      contracts.staker.contract.rewardPerTokenAccumulated(),
      contracts.staker.contract.REWARD_DURATION(),
    ]);

  return (
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <div className="font-black text-2xl mb-5">
          Introducing staking, the next chapter of Uniswap Governance
        </div>
        <div className="text-gray-700">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo.
        </div>

        <RedirectOrConnect />

        <div className="mt-10">
          <div className="font-black text-2xl mb-5">
            {token.symbol} Staking Metrics
          </div>
          <StakingStats
            rewardDuration={rewardDuration}
            rewardPerToken={rewardPerToken}
            totalStaked={totalStaked}
            totalSupply={totalSupply}
          />
        </div>

        <FAQs />
      </div>

      <div className="sm:col-start-5">
        <PanelNewDeposit />
      </div>
    </HStack>
  );
}
