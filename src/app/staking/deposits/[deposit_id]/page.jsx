"use server";

import React from "react";
import { apiFetchDeposit } from "@/app/api/staking/getDeposit";
import Link from "next/link";
import { HStack } from "@/components/Layout/Stack";
import DepositReceipt from "@/app/staking/components/DepositReceipt";
import RewardRedemptionCard from "@/components/Staking/RewardRedemptionCard";

export default async function Page({ params: { deposit_id } }) {
  const deposit = await apiFetchDeposit({ id: BigInt(deposit_id) });

  return (
    <div className="mt-12">
      <Link href="/staking" title="Back to staking">
        ------ Back
      </Link>

      <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10 mt-12">
        <div className="sm:col-span-4">
          <DepositReceipt deposit={deposit} />
        </div>
        <div className="sm:col-start-5">
          <RewardRedemptionCard deposit={deposit} />
        </div>
      </HStack>
    </div>

  );
}
