import { fetchCitizens as apiFetchCitizens } from "@/app/api/common/citizens/getCitizens";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import CitizenCardList from "@/components/Delegates/DelegateCardList/CitzenCardList";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import { TabsContent } from "@/components/ui/tabs";
import { citizensFilterOptions, delegatesFilterOptions } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import React from "react";
import { PaginationParams } from "@/app/lib/pagination";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";
import DelegateContent from "./DelegateContent";

async function fetchCitizens(
  sort: string,
  seed: number,
  pagination?: PaginationParams
) {
  "use server";

  return apiFetchCitizens({ pagination, seed, sort });
}

async function fetchDelegates(
  sort: string,
  seed: number,
  filters: any,
  pagination?: PaginationParams
) {
  "use server";

  return apiFetchDelegates({ pagination, seed, sort, filters });
}

async function fetchDelegators(address: string) {
  "use server";

  return apiFetchCurrentDelegators(address);
}

const DelegateCardWrapper = async ({ searchParams }: { searchParams: any }) => {
  const { ui } = Tenant.current();

  const sort =
    delegatesFilterOptions[
      searchParams.orderBy as keyof typeof delegatesFilterOptions
    ]?.sort || delegatesFilterOptions.weightedRandom.sort;
  const citizensSort =
    citizensFilterOptions[
      searchParams.citizensOrderBy as keyof typeof citizensFilterOptions
    ]?.value || citizensFilterOptions.shuffle.sort;

  const filters = {
    ...(searchParams.delegatorFilter && {
      delegator: searchParams.delegatorFilter,
    }),
    ...(searchParams.issueFilter && { issues: searchParams.issueFilter }),
    ...(searchParams.stakeholderFilter && {
      stakeholders: searchParams.stakeholderFilter,
    }),
  };

  const endorsedToggle = ui.toggle("delegates/endorsed-filter");
  if (endorsedToggle?.enabled) {
    const defaultFilter = (endorsedToggle.config as UIEndorsedConfig)
      .defaultFilter;
    filters.endorsed =
      searchParams?.endorsedFilter === undefined
        ? defaultFilter
        : searchParams.endorsedFilter === "true";
  }

  const tab = searchParams.tab;
  const seed = Math.random();
  const delegates =
    tab === "citizens"
      ? await fetchCitizens(citizensSort, seed)
      : await fetchDelegates(sort, seed, filters);

  return (
    <DelegateTabs>
      <TabsContent value="delegates">
        <DelegateContent
          isDelegatesCitizensFetching={tab === "citizens"}
          initialDelegates={delegates}
          fetchDelegates={async (pagination, seed) => {
            "use server";
            return apiFetchDelegates({ pagination, seed, sort, filters });
          }}
          // @ts-ignore
          fetchDelegators={fetchDelegators}
        />
      </TabsContent>
      <TabsContent value="citizens">
        <CitizenCardList
          isDelegatesCitizensFetching={tab !== "citizens"}
          initialDelegates={delegates}
          fetchDelegates={async (pagination, seed) => {
            "use server";

            return apiFetchCitizens({ pagination, seed, sort: citizensSort });
          }}
          // @ts-ignore
          fetchDelegators={fetchDelegators}
        />{" "}
      </TabsContent>
    </DelegateTabs>
  );
};

export const DelegateCardLoadingState = () => {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Delegates</h1>
        <div className="flex flex-row gap-2">
          <span className="block w-[150px] h-[36px] rounded-full bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[150px] h-[36px] rounded-full bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[150px] h-[36px] rounded-full bg-tertiary/10 animate-pulse"></span>
        </div>
      </div>
      <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-3 justify-around sm:justify-between py-4 gap-4 sm:gap-8">
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
      </div>
    </div>
  );
};

export default DelegateCardWrapper;
