"use server";

import React from "react";
import { NewStakeFlow } from "@/app/staking/components/NewStakeFlow";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { delegatesFilterOptions } from "@/lib/constants";

async function fetchDelegates(sort, seed, page = 1) {
  "use server";
  return apiFetchDelegates({ page, seed, sort });
}

export default async function Page({ searchParams }) {
  const sort =
    delegatesFilterOptions[searchParams.orderBy]?.sort ||
    delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await fetchDelegates(sort, seed);

  return (
    <div className="mt-12">
      <NewStakeFlow
        initialDelegates={delegates}
        fetchDelegates={async (page, seed) => {
          "use server";
          return apiFetchDelegates({ page, seed, sort });
        }}
      />
    </div>
  );
}
