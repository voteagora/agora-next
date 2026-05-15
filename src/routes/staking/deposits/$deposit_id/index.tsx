/*
 * TanStack Start port of src/app/staking/deposits/[deposit_id]/page.tsx.
 * URL: /staking/deposits/:deposit_id
 * Note: "use server" refreshPath replaced with no-op (router invalidation used instead).
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { EditDepositAmount } from "@/app/staking/deposits/[deposit_id]/components/EditDepositAmount";

const serverFetchDeposit = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const { apiFetchDeposit } = await import("@/app/api/staking/getDeposit");
    return apiFetchDeposit(data);
  });

export const Route = createFileRoute("/staking/deposits/$deposit_id/")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("staking")) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ params }) => {
    const deposit = await serverFetchDeposit({
      data: { id: Number(params.deposit_id) },
    });
    return { deposit };
  },
  component: function DepositPage() {
    const { deposit } = Route.useLoaderData();
    return (
      <div className="mt-12">
        <EditDepositAmount
          refreshPath={async (_path: string) => {}}
          deposit={deposit}
        />
      </div>
    );
  },
});
