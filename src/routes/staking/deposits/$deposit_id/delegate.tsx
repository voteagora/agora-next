/*
 * TanStack Start port of src/app/staking/deposits/[deposit_id]/delegate/page.tsx.
 * URL: /staking/deposits/:deposit_id/delegate
 * Note: "use server" callbacks replaced with createServerFn.
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { delegatesFilterOptions } from "@/lib/constants";
import { EditDelegateFlow } from "@/app/staking/deposits/[deposit_id]/delegate/components/EditDelegateFlow";

const sort = delegatesFilterOptions.weightedRandom.sort;

const serverFetchDeposit = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const { apiFetchDeposit } = await import("@/app/api/staking/getDeposit");
    return apiFetchDeposit(data);
  });

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

export const Route = createFileRoute("/staking/deposits/$deposit_id/delegate")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("staking")) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ params }) => {
    const seed = Math.random();
    const [delegates, deposit] = await Promise.all([
      serverFetchDelegates({
        data: { seed, pagination: { limit: 20, offset: 0 } },
      }),
      serverFetchDeposit({ data: { id: Number(params.deposit_id) } }),
    ]);
    return { delegates, deposit };
  },
  component: function DepositDelegatePage() {
    const { delegates, deposit } = Route.useLoaderData();
    return (
      <div className="mt-12">
        <EditDelegateFlow
          delegates={delegates}
          deposit={deposit}
          fetchDelegates={(args) =>
            serverFetchDelegates({ data: args as never })
          }
          refreshPath={async (_path: string) => {}}
        />
      </div>
    );
  },
});
