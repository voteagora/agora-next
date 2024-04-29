"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

export default async function Page({ params: { deposit_id } }) {
  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });

  return (
    <div>
      Withdraw Deposit id {deposit_id}
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
