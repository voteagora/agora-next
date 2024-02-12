import React from "react";
import Hero from "@/components/Hero/Hero";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { PageDivider } from "@/components/Layout/PageDivider";
import { getMetrics } from "../api/metrics/getMetrics";
import { getDelegates } from "../api/delegates/getDelegates";
import { getCitizens } from "../api/citizens/getCitizens";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import { citizensFilterOptions, delegatesFilterOptions } from "@/lib/constants";
import { getCurrentDelegators } from "../api/delegations/getDelegations";
import { TabsContent } from "@/components/ui/tabs";

async function fetchCitizens(sort, page = 1, seed) {
  "use server";

  return getCitizens({ page, seed, sort });
}

async function fetchDelegates(sort, page = 1, seed) {
  "use server";

  return getDelegates({ page, seed, sort });
}

async function fetchDaoMetrics() {
  "use server";

  return getMetrics();
}

async function fetchDelegators(address) {
  "use server";

  return getCurrentDelegators(address);
}

export async function generateMetadata({}, parent) {
  return {
    title: "Agora - Optimism Voters",
    description: "See which voters are active on Optimism governance.",
  };
}

export default async function Page({ searchParams }) {
  const sort = delegatesFilterOptions[searchParams.orderBy]?.sort || delegatesFilterOptions.weightedRandom.sort;
  const citizensSort =
    citizensFilterOptions[searchParams.citizensOrderBy]?.value || citizensFilterOptions.shuffle.sort;
  const seed = Math.random();
  const delegates = await fetchDelegates(sort);
  const citizens = await fetchCitizens(citizensSort);
  const metrics = await fetchDaoMetrics();

  return (
    <section>
      <Hero />
      <DAOMetricsHeader metrics={metrics} />
      <PageDivider />
      <DelegateTabs>
        <TabsContent value="delegates">
          <DelegateCardList
            initialDelegates={delegates}
            fetchDelegates={async (page) => {
              "use server";

              return getDelegates({ page, seed, sort });
            }}
            fetchDelegators={fetchDelegators}
          />
        </TabsContent>
        <TabsContent value="citizens">
          <DelegateCardList
            initialDelegates={citizens}
            fetchDelegates={async (page) => {
              "use server";

              return getCitizens({ page, seed, sort: citizensSort });
            }}
            fetchDelegators={fetchDelegators}
          />{" "}
        </TabsContent>
      </DelegateTabs>
    </section>
  );
}
