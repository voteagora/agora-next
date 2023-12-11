import React from "react";
import { getDelegates } from "../api/delegates/getDelegates";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { delegatesFilterOptions } from "@/lib/constants";

async function fetchDelegates(sort, page = 1, seed) {
  "use server";

  return getDelegates({ page, seed, sort });
}

export default async function Page({ searchParams }) {
  const sort =
    delegatesFilterOptions[searchParams.orderBy]?.sort || "weighted_random";
  const seed = Math.random();
  const delegates = await fetchDelegates(sort);

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-baseline gap-2">
        <PageHeader headerText="All Delegates" />
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full md:w-fit">
          <DelegatesSearch />
          <DelegatesFilter />
        </div>
      </div>
      <DelegateCardList
        initialDelegates={delegates}
        fetchDelegates={async (page) => {
          "use server";

          return getDelegates({ page, seed, sort });
        }}
      />
    </section>
  );
}
