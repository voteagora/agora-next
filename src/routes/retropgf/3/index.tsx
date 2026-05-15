/*
 * TanStack Start port of src/app/retropgf/3/page.tsx.
 * URL: /retropgf/3
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import RetroPGFResults, {
  type Results,
} from "@/components/RetroPGF/RetroPGFResults";
import RetroPGFHero from "@/components/RetroPGF/RetroPGFHero";
import RetroPGFFilters from "@/components/RetroPGF/RetroPGFFilters";
import { getRetroPGFResults } from "@/app/retropgf/actions";
import { retroPGFCategories, retroPGFSort } from "@/lib/constants";

type RetroPGFSearch = {
  search?: string;
  category?: keyof typeof retroPGFCategories;
  orderBy?: keyof typeof retroPGFSort;
};

type RetroPGFPageInfo = {
  hasNextPage: boolean;
  endCursor: string;
};

const emptyResults = {
  edges: [] as Results,
  pageInfo: { hasNextPage: false, endCursor: "" } satisfies RetroPGFPageInfo,
};

export const Route = createFileRoute("/retropgf/3/")({
  validateSearch: (search: Record<string, unknown>): RetroPGFSearch => ({
    search: typeof search.search === "string" ? search.search : undefined,
    category:
      typeof search.category === "string" &&
      search.category in retroPGFCategories
        ? (search.category as keyof typeof retroPGFCategories)
        : undefined,
    orderBy:
      typeof search.orderBy === "string" && search.orderBy in retroPGFSort
        ? (search.orderBy as keyof typeof retroPGFSort)
        : undefined,
  }),
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("retropgf")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Agora - Optimism's RetroPGF Round 3 Summary" },
      {
        name: "description",
        content:
          "See which of your favourite projects were allocated in Optimism's RetroPGF Round 3.",
      },
    ],
  }),
  loaderDeps: ({ search }) => ({
    search: search.search,
    category: search.category,
    orderBy: search.orderBy,
  }),
  loader: async ({ deps }) => {
    const projects = await getRetroPGFResults({
      search: deps.search || "",
      category: deps.category || null,
      orderBy: deps.orderBy || "mostAwarded",
    }).catch((error) => {
      console.error("error", error);
      return emptyResults;
    });

    return {
      initialResults: projects.edges as Results,
      initialPageInfo: projects.pageInfo as RetroPGFPageInfo,
    };
  },
  component: function RetroPGFPage() {
    const { initialResults, initialPageInfo } = Route.useLoaderData();

    return (
      <div>
        <RetroPGFHero />
        <RetroPGFFilters />
        <RetroPGFResults
          initialResults={initialResults}
          initialPageInfo={initialPageInfo}
        />
      </div>
    );
  },
});
