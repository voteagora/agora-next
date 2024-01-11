import React from "react";
import Hero from "@/components/Hero/Hero";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { PageDivider } from "@/components/Layout/PageDivider";
import { getMetrics } from "../api/metrics/getMetrics";
import { getDelegates } from "../api/delegates/getDelegates";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import { delegatesFilterOptions } from "@/lib/constants";
import {
  getProxy,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "../api/voting-power/getVotingPower";
import { getCurrentDelegatees } from "../api/delegations/getDelegations";
import { TabsContent } from "@/components/ui/tabs";

async function fetchDelegates(sort, page = 1, seed) {
  "use server";

  return getDelegates({ page, seed, sort });
}

// Pass address of the connected wallet
async function fetchVotingPowerForSubdelegation(addressOrENSName) {
  "use server";

  return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

// Pass address of the connected wallet
async function checkIfDelegatingToProxy(addressOrENSName) {
  "use server";

  return isDelegatingToProxy({ addressOrENSName });
}

// Pass address of the connected wallet
async function fetchBalanceForDirectDelegation(addressOrENSName) {
  "use server";

  return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

// Pass address of the connected wallet
async function fetchCurrentDelegatees(addressOrENSName) {
  "use server";

  return getCurrentDelegatees({ addressOrENSName });
}

// Pass address of the connected wallet
async function getProxyAddress(addressOrENSName) {
  "use server";

  return getProxy({ addressOrENSName });
}

async function fetchDaoMetrics() {
  "use server";

  return getMetrics();
}

export default async function Page({ searchParams }) {
  const sort =
    delegatesFilterOptions[searchParams.orderBy]?.sort || "weighted_random";
  const seed = Math.random();
  const delegates = await fetchDelegates(sort);
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
            fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchCurrentDelegatees={fetchCurrentDelegatees}
            getProxyAddress={getProxyAddress}
          />
        </TabsContent>
        <TabsContent value="citizens">
          <DelegateCardList
            initialDelegates={delegates}
            fetchDelegates={async (page) => {
              "use server";

              return getDelegates({ page, seed, sort });
            }}
            fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchCurrentDelegatees={fetchCurrentDelegatees}
            getProxyAddress={getProxyAddress}
          />{" "}
        </TabsContent>
      </DelegateTabs>
    </section>
  );
}
