import { TabsContent } from "@/components/ui/tabs";
import DelegateContent from "./DelegateContent";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import { loadDelegatesSearchParams } from "@/app/delegates/search-params";

import { PaginationParams } from "@/app/lib/pagination";
import { SearchParams } from "nuqs/server";
import { buildDelegateFilters } from "./delegateUtils";
import Tenant from "@/lib/tenant/tenant";

async function fetchDelegatesWithParams(
  sort: string,
  filters: any,
  pagination: PaginationParams,
  seed: number | undefined,
  showParticipation?: boolean
) {
  "use server";
  const { fetchDelegates: apiFetchDelegates } = await import(
    "@/app/api/common/delegates/getDelegates"
  );
  return apiFetchDelegates({
    pagination,
    seed,
    sort,
    filters,
    showParticipation,
  });
}

const DelegateCardWrapper = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const parsedParams = loadDelegatesSearchParams(searchParams);

  // Get sort values directly from parsed params and sanitize based on UI flags
  const { ui } = Tenant.current();
  const hide7dChange = ui.toggle("hide-7d-change")?.enabled ?? false;
  const rawSort = parsedParams.orderBy;
  const sort =
    hide7dChange &&
    (rawSort === "vp_change_7d" || rawSort === "vp_change_7d_desc")
      ? "weighted_random"
      : rawSort;

  // Use the utility function to build filters from parsed params
  const filters = buildDelegateFilters(parsedParams);

  const tab = parsedParams.tab;
  const seed = Math.random();

  const showParticipation =
    (ui.toggle("show-participation")?.enabled || false) &&
    !(ui.toggle("hide-participation-delegates-page")?.enabled || false);

  const delegates = await fetchDelegatesWithParams(
    sort,
    filters,
    { offset: 0, limit: 500 },
    seed,
    showParticipation
  );
  return (
    <DelegateTabs>
      <TabsContent value="delegates">
        <DelegateContent
          initialDelegates={delegates}
          fetchDelegates={async ({
            pagination = { offset: 0, limit: 500 },
            seed,
            showParticipation,
          }) => {
            "use server";
            return fetchDelegatesWithParams(
              sort,
              filters,
              pagination,
              seed,
              showParticipation
            );
          }}
        />
      </TabsContent>
    </DelegateTabs>
  );
};

export const DelegateCardLoadingState = () => {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-primary font-bold">Delegates</h1>
        <div className="flex flex-row gap-2 mt-3 md:mt-0">
          <span className="hidden md:block w-[42px] md:w-[228px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[42px] md:w-[115px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[42px] md:w-[98px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[42px] md:w-[66px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
        </div>
      </div>
      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-around sm:justify-between py-4 gap-4 sm:gap-8">
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
