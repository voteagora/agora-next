import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function totalSupply() {
  const { contracts } = Tenant.current();
  return await contracts.token.contract.totalSupply();
}

export const apiFetchTotalSupply = cache(totalSupply);