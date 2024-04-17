import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function rewardEndTime() {
  const { contracts } = Tenant.current();
  return await contracts.staker!.contract.rewardEndTime();
}

export const apiFetchRewardEndTime = cache(rewardEndTime);