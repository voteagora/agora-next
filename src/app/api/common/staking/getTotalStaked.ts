import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function totalStaked() {
  const { contracts } = Tenant.current();
  return await contracts.staker!.contract.totalStaked();
}

export const apiFetchTotalStaked = cache(totalStaked);
