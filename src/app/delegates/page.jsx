import React from "react";
import Hero from "@/components/Hero/Hero";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { PageDivider } from "@/components/Layout/PageDivider";
import { getMetrics } from "../api/metrics/getMetrics";
import { getDelegates } from "../api/delegates/getDelegates";
import DelegateCardList from "@/components/Delegates/DelegateCardList/DelegateCardList";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { delegatesFilterOptions } from "@/lib/constants";
import {
  getProxy,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "../api/voting-power/getVotingPower";
import {
  getCurrentDelegatees,
  getCurrentDelegators,
  getDirectDelegatee,
} from "../api/delegations/getDelegations";

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

async function fetchDirectDelegatee(addressOrENSName) {
  "use server";

  return getDirectDelegatee({ addressOrENSName });
}

async function getDelegators(addressOrENSName) {
  "use server";

  return getCurrentDelegators({ addressOrENSName });
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
        fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
        fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
        checkIfDelegatingToProxy={checkIfDelegatingToProxy}
        fetchCurrentDelegatees={fetchCurrentDelegatees}
        getProxyAddress={getProxyAddress}
        fetchDirectDelegatee={fetchDirectDelegatee}
        getDelegators={getDelegators}
      />
    </section>
  );
}
