import { fetchCitizens as apiFetchCitizens } from "@/app/api/common/citizens/getCitizens";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { TabsContent } from "@/components/ui/tabs";
import DelegateContent from "./DelegateContent";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import { loadDelegatesSearchParams } from "@/app/delegates/search-params";

import { PaginationParams } from "@/app/lib/pagination";
import { SearchParams } from "nuqs/server";
import { buildDelegateFilters } from "./delegateUtils";
import CitizenCardList from "./CitzenCardList";

async function fetchCitizens(
  sort: string,
  seed: number,
  pagination?: PaginationParams
) {
  "use server";

  return apiFetchCitizens({ pagination, seed, sort });
}

async function fetchDelegates(
  seed: number,
  sort?: string,
  filters?: any,
  pagination?: PaginationParams
) {
  "use server";
  return apiFetchDelegates({ pagination, seed, sort: sort || "", filters });
}
const DelegateCardWrapper = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const parsedParams = loadDelegatesSearchParams(searchParams);

  // Get sort values directly from parsed params
  const sort = parsedParams.orderBy;
  const citizensSort = parsedParams.citizensOrderBy;

  // Use the utility function to build filters from parsed params
  const filters = buildDelegateFilters(parsedParams);

  const tab = parsedParams.tab;
  const seed = Math.random();
  const delegates =
    tab === "citizens"
      ? await fetchCitizens(citizensSort, seed)
      : await fetchDelegates(seed, sort, filters);
  return (
    <DelegateTabs>
      <TabsContent value="delegates">
        <DelegateContent
          initialDelegates={delegates}
          fetchDelegates={async (pagination, seed) => {
            "use server";
            return apiFetchDelegates({ pagination, seed, sort, filters });
          }}
        />
      </TabsContent>
      <TabsContent value="citizens">
        <CitizenCardList
          initialDelegates={delegates}
          fetchDelegates={async (
            pagination: PaginationParams,
            seed?: number
          ) => {
            "use server";
            // Handle the case where seed might be undefined
            return apiFetchCitizens({
              pagination,
              seed,
              sort: citizensSort,
            });
          }}
        />
      </TabsContent>
    </DelegateTabs>
  );
};

export default DelegateCardWrapper;

export const DelegateCardLoadingState = () => {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl text-primary font-bold">Delegates</h1>
        <div className="flex flex-row gap-2">
          <span className="block w-[228px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[115px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[98px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[66px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
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
