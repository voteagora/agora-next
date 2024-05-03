"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import { StakeEditFlow } from "@/app/staking/deposits/[deposit_id]/components/StakeEditFlow";
import { delegatesFilterOptions } from "@/lib/constants";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";

export default async function Page({ params: { deposit_id } }) {

  const sort = delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await apiFetchDelegates({ page: 1, seed, sort });

  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });

  return (
    <div className="mt-12">
      <StakeEditFlow
        deposit={deposit}
        delegates={delegates}
        fetchDelegates={async (page, seed) => {
          "use server";
          return apiFetchDelegates({ page, seed, sort });
        }}
      />
    </div>
  );
}
