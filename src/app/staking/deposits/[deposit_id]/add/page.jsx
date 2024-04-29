"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Link from "next/link";

export default async function Page({ params: { deposit_id } }) {
  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });

  return (
    <div className="mt-12">
      <Link href="/staking" title="Back to staking">
        Back
      </Link>
      Add Deposit id {deposit_id}
      <ul>
        <li>{deposit.id}</li>
        <li>{deposit.depositor}</li>
        <li>{deposit.delegatee}</li>
        <li>
          <TokenAmountDisplay
            maximumSignificantDigits={4}
            amount={deposit.amount}
          />
        </li>
      </ul>
    </div>
  );
}
