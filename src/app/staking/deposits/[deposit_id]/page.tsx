"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import { EditDepositAmount } from "@/app/staking/deposits/[deposit_id]/components/EditDepositAmount";
import { revalidatePath } from "next/cache";
import Tenant from "@/lib/tenant/tenant";
import { RouteNotSupported } from "@/components/shared/RouteNotSupported";

interface Props {
  params: {
    deposit_id: string;
  };
}

export default async function Page({ params: { deposit_id } }: Props) {
  const { ui } = Tenant.current();
  if (!ui.toggle("staking")) {
    return <RouteNotSupported />;
  }

  const deposit = await apiFetchDeposit({ id: Number(deposit_id) });

  return (
    <div className="mt-12">
      <EditDepositAmount
        refreshPath={async (path) => {
          "use server";
          revalidatePath(path);
        }}
        deposit={deposit}
      />
    </div>
  );
}
