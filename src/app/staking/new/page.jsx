"use server";

import React from "react";
import { NewStakeFlow } from "@/app/staking/components/NewStakeFlow";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { delegatesFilterOptions } from "@/lib/constants";

export default async function Page() {

  const sort = delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await apiFetchDelegates({ page: 1, seed, sort });

  return (
    <div className="mt-12">
      <NewStakeFlow
        delegates={delegates}
        fetchDelegates={async (page, seed) => {
          "use server";
          return apiFetchDelegates({ page, seed, sort });
        }}
      />
    </div>
  );
}
