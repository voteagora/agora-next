import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import Delegates from "@/components/Staking/Delegates";
import { delegatesFilterOptions } from "@/lib/constants";

async function fetchDelegates(sort, seed, page = 1) {
  "use server";
  return apiFetchDelegates({ page, seed, sort });
}

async function fetchDelegators(address) {
  "use server";
  return apiFetchCurrentDelegators(address);
}

export default async function Page({ searchParams }) {
  const sort =
    delegatesFilterOptions[searchParams.orderBy]?.sort ||
    delegatesFilterOptions.weightedRandom.sort;

  const seed = Math.random();
  const delegates = await fetchDelegates(sort, seed);

  const { ui } = Tenant.current();

  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <Delegates
      initialDelegates={delegates}
      fetchDelegates={async (page, seed) => {
        "use server";
        return apiFetchDelegates({ page, seed, sort });
      }}
      fetchDelegators={fetchDelegators}
    />
  );
}
