"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import { EditDepositAmount } from "@/app/staking/deposits/[deposit_id]/components/EditDepositAmount";

export default async function Page({ params: { deposit_id } }) {
  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });

  return (
    <div className="mt-12">
      <EditDepositAmount deposit={deposit} />
    </div>
  );
}
