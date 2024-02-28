import { getCitizens } from "@/app/api/common/citizens/getCitizens";
import { getDelegates } from "@/app/api/common/delegates/getDelegates";
import { getCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import { getMetrics } from "@/app/api/common/metrics/getMetrics";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { TabsContent } from "@/components/ui/tabs";
import { citizensFilterOptions, delegatesFilterOptions } from "@/lib/constants";
import React from "react";

async function fetchCitizens(sort, seed, page = 1) {
  "use server";

  return getCitizens({ page, seed, sort });
}

async function fetchDelegates(sort, seed, page = 1) {
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
  const preview = `/api/images/og/delegates`;
  const title = "Voter on Agora";
  const description = "Delegate your voting power to a trusted representative";

  return {
    title: title,
    description: description,
    openGraph: {
      images: preview,
    },
    other: {
      ["twitter:card"]: "summary_large_image",
      ["twitter:title"]: title,
      ["twitter:description"]: description,
      ["twitter:image"]: preview,
    },
  };
}

export default async function Page({ searchParams }) {
  const sort =
    delegatesFilterOptions[searchParams.orderBy]?.sort ||
    delegatesFilterOptions.weightedRandom.sort;
  const citizensSort =
    citizensFilterOptions[searchParams.citizensOrderBy]?.value ||
    citizensFilterOptions.shuffle.sort;
  const seed = Math.random();
  const delegates = await fetchDelegates(sort, seed);
  const citizens = await fetchCitizens(citizensSort, seed);
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
            fetchDelegates={async (page, seed) => {
              "use server";

              return getDelegates({ page, seed, sort });
            }}
            fetchDelegators={fetchDelegators}
          />
        </TabsContent>
        <TabsContent value="citizens">
          <DelegateCardList
            initialDelegates={citizens}
            fetchDelegates={async (page, seed) => {
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
