import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { StakeHome } from "@/app/staking/components/StakeHome";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";

async function fetchDeposits(address) {
  "use server";
  return apiFetchStakedDeposits({ address });
}

async function apiFetchDelegate(address) {
  "use server";
  return fetchDelegate(address);
}

export default async function Page() {
  const { ui, contracts } = Tenant.current();

  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  const [totalSupply, totalStaked, rewardPerToken, rewardDuration] =
    await Promise.all([
      contracts.token.contract.totalSupply(),
      contracts.staker.contract.totalStaked(),
      contracts.staker.contract.rewardPerTokenAccumulated(),
      contracts.staker.contract.REWARD_DURATION(),
    ]);

  return (
    <StakeHome
      fetchDeposits={fetchDeposits}
      fetchDelegate={apiFetchDelegate}
      totalSupply={totalSupply}
      totalStaked={totalStaked}
      rewardPerToken={rewardPerToken}
      rewardDuration={rewardDuration}
    />
  );
}
