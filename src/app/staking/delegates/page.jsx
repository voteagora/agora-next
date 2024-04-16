import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import DelegateCardList from "@/components/Staking/Delegates/DelegateCardList/DelegateCardList";
import SelectDelegatesHeader from "@/components/Staking/Delegates/SelectDelegatesHeader/SelectDelegatesHeader";
import { delegatesFilterOptions } from "@/lib/constants";
import { HStack } from "@/components/Layout/Stack";
import SelectedDelegatesFeeCard from "@/components/Staking/Delegates/SelectedDelegatesFeeCard";

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
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <SelectDelegatesHeader />
        <DelegateCardList
          initialDelegates={delegates}
          fetchDelegates={async (page, seed) => {
            "use server";

            return apiFetchDelegates({ page, seed, sort });
          }}
          fetchDelegators={fetchDelegators}
        />
      </div>
      <div className="sm:col-start-5">
        <SelectedDelegatesFeeCard />
      </div>
    </HStack>
  );
}
