import { fetchCitizens as apiFetchCitizens } from "@/app/api/common/citizens/getCitizens";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import Hero from "@/components/Hero/Hero";
import { TabsContent } from "@/components/ui/tabs";
import { citizensFilterOptions, delegatesFilterOptions } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import React from "react";

async function fetchCitizens(sort, seed, page = 1) {
  "use server";

  return apiFetchCitizens({ page, seed, sort });
}

async function fetchDelegates(sort, seed, filters, page = 1) {
  "use server";

  return apiFetchDelegates({ page, seed, sort, filters });
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  const filters = {
    ...(searchParams.issueFilter && { issues: searchParams.issueFilter }),
    ...(searchParams.stakeholderFilter && {
      stakeholders: searchParams.stakeholderFilter,
    }),
    ...(searchParams.endorsedFilter && {
      endorsed: searchParams.endorsedFilter,
    }),
  };

  const tab = searchParams.tab;
  const seed = Math.random();
  const delegates =
    tab === "citizens"
      ? await fetchCitizens(citizensSort, seed)
      : await fetchDelegates(sort, seed, filters);

  return (
    <section>
      <Hero />
      <DelegateTabs>
        <TabsContent value="delegates">
          <DelegateCardList
            isDelegatesCitizensFetching={tab === "citizens"}
            initialDelegates={delegates}
            fetchDelegates={async (page, seed) => {
              "use server";
              return apiFetchDelegates({ page, seed, sort, filters });
            }}
            fetchDelegators={fetchDelegators}
          />
        </TabsContent>
        <TabsContent value="citizens">
          <DelegateCardList
            isDelegatesCitizensFetching={tab !== "citizens"}
            initialDelegates={delegates}
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
