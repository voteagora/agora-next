"use server";

import React from "react";
import { NewStakeFlow } from "@/app/staking/new/components/NewStakeFlow";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { delegatesFilterOptions } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import Tenant from "@/lib/tenant/tenant";

export default async function Page() {
  const { ui } = Tenant.current();
  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  const sort = delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await apiFetchDelegates({
    pagination: { limit: 20, offset: 0 },
    seed,
    sort,
  });

  return (
    <div className="mt-12">
      <NewStakeFlow
        delegates={delegates}
        fetchDelegates={async (pagination, seed) => {
          "use server";
          return apiFetchDelegates({ pagination, seed, sort });
        }}
        refreshPath={async (path) => {
          "use server";
          revalidatePath(path);
        }}
      />
    </div>
  );
}
