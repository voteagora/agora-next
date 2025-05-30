export const dynamic = "force-dynamic"; // needed for both app and e2e
// Note this page used to be 'use server', but appears to function fine without this directive with the above enabled.

import React from "react";
import { NewStakeFlow } from "@/app/staking/new/components/NewStakeFlow";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { delegatesFilterOptions } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import Tenant from "@/lib/tenant/tenant";
import { RouteNotSupported } from "@/components/shared/RouteNotSupported";

export default async function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("staking")?.enabled) {
    return <RouteNotSupported />;
  }

  const sort = delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await apiFetchDelegates({
    pagination: { limit: 20, offset: 0 },
    seed,
    sort,
  });

  return (
    <div className="mt-12">
      <NewStakeFlow
        delegates={delegates}
        fetchDelegates={async (args) => {
          "use server";
          return apiFetchDelegates({ ...args, sort });
        }}
        refreshPath={async (path) => {
          "use server";
          revalidatePath(path);
        }}
      />
    </div>
  );
}
