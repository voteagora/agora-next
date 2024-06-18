"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import { delegatesFilterOptions } from "@/lib/constants";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { EditDelegateFlow } from "@/app/staking/deposits/[deposit_id]/delegate/components/EditDelegateFlow";
import { revalidatePath } from "next/cache";
import Tenant from "@/lib/tenant/tenant";

export default async function Page({ params: { deposit_id } }) {
  const { ui } = Tenant.current();
  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  const sort = delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await apiFetchDelegates({ page: 1, seed, sort });
  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });
  return (
    <div className="mt-12">
      <EditDelegateFlow
        deposit={deposit}
        delegates={delegates}
        fetchDelegates={async (page, seed) => {
          "use server";
          return apiFetchDelegates({ page, seed, sort });
        }}
        refreshPath={async (path) => {
          "use server";
          revalidatePath(path);
        }}
      />
    </div>
  );
}
