"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/snapshot/getDeposit";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Link from "next/link";

export default async function Page({ params: { deposit_id } }) {
  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });

  return (
    <div>
      <div className="my-12 flex flex-row gap-2">
        <div>
          <Link className="my-2" href="/staking" title="Back to staking">
            Back
          </Link>
        </div>
        <div className="font-black text-2xl mb-4">
          Edit your stake {deposit.id}
        </div>
      </div>
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
