import { fetchCitizens as apiFetchCitizens } from "@/app/api/common/citizens/getCitizens";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import { fetchMetrics as apiFetchMetrics } from "@/app/api/common/metrics/getMetrics";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import Hero from "@/components/Hero/Hero";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { TabsContent } from "@/components/ui/tabs";
import { citizensFilterOptions, delegatesFilterOptions } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import React from "react";

async function fetchCitizens(sort, seed, page = 1) {
  "use server";

  return apiFetchCitizens({ page, seed, sort });
}

async function fetchDelegates(sort, seed, page = 1) {
  "use server";

  return apiFetchDelegates({ page, seed, sort });
}

async function fetchDaoMetrics() {
  "use server";

  return apiFetchMetrics();
}

async function fetchDelegators(address) {
  "use server";

  return apiFetchCurrentDelegators(address);
}

export async function generateMetadata({}, parent) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("delegates");
  const { title, description } = page.meta;

  const preview = `/api/images/og/delegates?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
        },
      ],
    },
    other: {
      ["twitter:card"]: "summary_large_image",
      ["twitter:title"]: title,
      ["twitter:description"]: description,
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
      <DelegateTabs>
        <TabsContent value="delegates">
          <DelegateCardList
            initialDelegates={delegates}
            fetchDelegates={async (page, seed) => {
              "use server";

              return apiFetchDelegates({ page, seed, sort });
            }}
            fetchDelegators={fetchDelegators}
          />
        </TabsContent>
        <TabsContent value="citizens">
          <DelegateCardList
            initialDelegates={citizens}
            fetchDelegates={async (page, seed) => {
              "use server";

              return apiFetchCitizens({ page, seed, sort: citizensSort });
            }}
            fetchDelegators={fetchDelegators}
          />{" "}
        </TabsContent>
      </DelegateTabs>
    </section>
  );
}
