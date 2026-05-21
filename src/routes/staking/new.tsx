/*
 * TanStack Start port of src/app/staking/new/page.tsx.
 * URL: /staking/new
 * Note: "use server" fetchDelegates and refreshPath replaced with createServerFn.
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { delegatesFilterOptions } from "@/lib/constants";
import { NewStakeFlow } from "@/components/Staking/NewStakeFlow";

const sort = delegatesFilterOptions.weightedRandom.sort;

const serverFetchDelegates = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { seed?: number; pagination?: { limit: number; offset: number } }) =>
      data
  )
  .handler(async ({ data }) => {
    const { fetchDelegates } = await import(
      "@/app/api/common/delegates/getDelegates"
    );
    return fetchDelegates({ ...data, sort });
  });

export const Route = createFileRoute("/staking/new")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("staking")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  loader: async () => {
    const seed = Math.random();
    const delegates = await serverFetchDelegates({
      data: { seed, pagination: { limit: 20, offset: 0 } },
    });
    return { delegates };
  },
  component: function StakingNewPage() {
    const { delegates } = Route.useLoaderData();
    return (
      <div className="mt-12">
        <NewStakeFlow
          delegates={delegates}
          fetchDelegates={(args) =>
            serverFetchDelegates({ data: args as never })
          }
          refreshPath={async (_path: string) => {}}
        />
      </div>
    );
  },
});
