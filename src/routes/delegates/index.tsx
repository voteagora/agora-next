/*
 * TanStack Start port of src/app/delegates/page.tsx.
 * URL: /delegates
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { TabsContent } from "@/components/ui/tabs";

import Tenant from "@/lib/tenant/tenant";
import Hero from "@/components/Hero/Hero";
import DelegateTabs from "@/components/Delegates/DelegatesTabs/DelegatesTabs";
import DelegateContent from "@/components/Delegates/DelegateCardList/DelegateContent";
import { DelegateCardLoadingState } from "@/components/Delegates/DelegateCardList/DelegateCardWrapper";
import { buildDelegateFilters } from "@/components/Delegates/DelegateCardList/delegateUtils";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import type { DelegateChunk } from "@/app/api/common/delegates/delegate";
import type { DelegateFilters } from "@/components/Delegates/DelegateCardList/delegateUtils";

// ─── server function ──────────────────────────────────────────────────────────

const serverFetchDelegates = createServerFn({ method: "GET" })
  .inputValidator(
    (data: {
      sort: string;
      filters: DelegateFilters;
      pagination: { offset: number; limit: number };
      seed: number | undefined;
      showParticipation: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    const { fetchDelegates } = await import(
      "@/app/api/common/delegates/getDelegates"
    );
    return (await fetchDelegates({
      pagination: data.pagination,
      seed: data.seed,
      sort: data.sort,
      filters: data.filters,
      showParticipation: data.showParticipation,
    })) as PaginatedResult<DelegateChunk[]>;
  });

// ─── route ────────────────────────────────────────────────────────────────────

type DelegatesSearch = {
  orderBy: string;
  [ENDORSED_FILTER_PARAM]: boolean;
  [HAS_STATEMENT_FILTER_PARAM]: boolean;
  [MY_DELEGATES_FILTER_PARAM]: string;
  // Kept as arrays in validateSearch (nuqs compatibility); serialised to
  // comma-strings in loaderDeps to guarantee stable deep-equal comparison.
  [ISSUES_FILTER_PARAM]: string[];
  [STAKEHOLDERS_FILTER_PARAM]: string[];
};

export const Route = createFileRoute("/delegates/")({
  validateSearch: (search: Record<string, unknown>): DelegatesSearch => ({
    orderBy:
      typeof search.orderBy === "string" ? search.orderBy : "weighted_random",
    [ENDORSED_FILTER_PARAM]:
      search[ENDORSED_FILTER_PARAM] === true ||
      search[ENDORSED_FILTER_PARAM] === "true",
    [HAS_STATEMENT_FILTER_PARAM]:
      search[HAS_STATEMENT_FILTER_PARAM] === true ||
      search[HAS_STATEMENT_FILTER_PARAM] === "true",
    [MY_DELEGATES_FILTER_PARAM]:
      typeof search[MY_DELEGATES_FILTER_PARAM] === "string"
        ? (search[MY_DELEGATES_FILTER_PARAM] as string)
        : "",
    [ISSUES_FILTER_PARAM]: Array.isArray(search[ISSUES_FILTER_PARAM])
      ? (search[ISSUES_FILTER_PARAM] as string[])
      : [],
    [STAKEHOLDERS_FILTER_PARAM]: Array.isArray(
      search[STAKEHOLDERS_FILTER_PARAM]
    )
      ? (search[STAKEHOLDERS_FILTER_PARAM] as string[])
      : [],
  }),
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("delegates")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const { ui } = Tenant.current();
    const page = ui.page("delegates");
    const { title, description } = page?.meta ?? {
      title: "Delegates",
      description: "Delegates",
    };
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  loaderDeps: ({ search }) => ({
    orderBy: search.orderBy,
    [ENDORSED_FILTER_PARAM]: search[ENDORSED_FILTER_PARAM],
    [HAS_STATEMENT_FILTER_PARAM]: search[HAS_STATEMENT_FILTER_PARAM],
    [MY_DELEGATES_FILTER_PARAM]: search[MY_DELEGATES_FILTER_PARAM],
    // Serialise arrays → strings so TanStack Router's deep-equal comparison
    // works correctly and doesn't re-fire the loader on every render.
    [ISSUES_FILTER_PARAM]: search[ISSUES_FILTER_PARAM].join(","),
    [STAKEHOLDERS_FILTER_PARAM]: search[STAKEHOLDERS_FILTER_PARAM].join(","),
  }),
  loader: async ({ deps }) => {
    const { ui } = Tenant.current();
    const hide7dChange = ui.toggle("hide-7d-change")?.enabled ?? false;
    const showParticipation =
      (ui.toggle("show-participation")?.enabled || false) &&
      !(ui.toggle("hide-participation-delegates-page")?.enabled || false);

    const rawSort = deps.orderBy;
    const sort =
      hide7dChange &&
      (rawSort === "vp_change_7d" || rawSort === "vp_change_7d_desc")
        ? "weighted_random"
        : rawSort;

    // Re-expand the comma-strings back into arrays for buildDelegateFilters.
    const depsWithArrays = {
      ...deps,
      [ISSUES_FILTER_PARAM]: deps[ISSUES_FILTER_PARAM]
        ? deps[ISSUES_FILTER_PARAM].split(",")
        : [],
      [STAKEHOLDERS_FILTER_PARAM]: deps[STAKEHOLDERS_FILTER_PARAM]
        ? deps[STAKEHOLDERS_FILTER_PARAM].split(",")
        : [],
    };
    const filters = buildDelegateFilters(depsWithArrays);
    const seed = Math.random();

    // Fetch one batch (matches DelegateCardList's batchSize). The client will
    // request more pages via fetchDelegates as the user scrolls.
    const delegates = await serverFetchDelegates({
      data: {
        sort,
        filters,
        pagination: { offset: 0, limit: 50 },
        seed,
        showParticipation,
      },
    });

    return { delegates, sort, filters, seed, showParticipation };
  },
  pendingComponent: () => <DelegateCardLoadingState />,
  component: function DelegatesPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    const { delegates, sort, filters, seed, showParticipation } = data;

    return (
      <section>
        <Hero page="delegates" />
        <DelegateTabs>
          <TabsContent value="delegates">
            <DelegateContent
              initialDelegates={delegates}
              fetchDelegates={({
                pagination = { offset: 0, limit: 50 },
                seed: paginationSeed,
                showParticipation: sp,
              }: {
                pagination?: PaginationParams;
                seed?: number;
                showParticipation?: boolean;
              }) =>
                serverFetchDelegates({
                  data: {
                    sort,
                    filters,
                    pagination,
                    seed: paginationSeed ?? seed,
                    showParticipation: sp ?? showParticipation,
                  },
                })
              }
            />
          </TabsContent>
        </DelegateTabs>
      </section>
    );
  },
});
