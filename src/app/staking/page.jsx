import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { StakeHome } from "@/app/staking/components/StakeHome";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";

async function fetchDeposits(address) {
  "use server";
  return apiFetchStakedDeposits({ address });
}

export default async function Page() {

  const { ui, contracts } = Tenant.current();

  const [totalSupply, rewardPerToken, rewardDuration] = await Promise.all([
    contracts.token.contract.totalSupply(),
    contracts.staker.contract.rewardPerTokenAccumulated(),
    contracts.staker.contract.REWARD_DURATION(),
  ]);

  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  return <StakeHome
    fetchDeposits={fetchDeposits}
    totalSupply={totalSupply}
    rewardPerToken={rewardPerToken}
    rewardDuration={rewardDuration} />;
}
