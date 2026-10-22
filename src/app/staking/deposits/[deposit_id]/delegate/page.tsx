"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import { delegatesFilterOptions } from "@/lib/constants";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { EditDelegateFlow } from "@/app/staking/deposits/[deposit_id]/delegate/components/EditDelegateFlow";
import { revalidatePath } from "next/cache";
import Tenant from "@/lib/tenant/tenant";
import { RouteNotSupported } from "@/components/shared/RouteNotSupported";

interface Props {
  params: Promise<{
    deposit_id: string;
  }>;
}

export default async function Page(props: Props) {
  const params = await props.params;

  const { deposit_id } = params;

  const { ui } = Tenant.current();
  if (!ui.toggle("staking")) {
    return <RouteNotSupported />;
  }

  const sort = delegatesFilterOptions.weightedRandom.sort;
  const seed = Math.random();
  const delegates = await apiFetchDelegates({ seed, sort });
  const deposit = await apiFetchDeposit({ id: Number(deposit_id) });
  return (
    <div className="mt-12">
      <EditDelegateFlow
        deposit={deposit}
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
