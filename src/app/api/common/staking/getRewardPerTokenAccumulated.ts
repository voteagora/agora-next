import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function rewardPerTokenAccumulated() {
  const { contracts } = Tenant.current();
  return await contracts.staker!.contract.rewardPerTokenAccumulated();
}

export const apiFetchRewardPerTokenAccumulated = cache(
  rewardPerTokenAccumulated
);
