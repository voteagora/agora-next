"use server";

import React from "react";
import Link from "next/link";
import { StakeAndDelegate } from "@/app/staking/components/StakeAndDelegate";
import { HStack } from "@/components/Layout/Stack";
import DepositReceipt from "@/app/staking/components/DepositReceipt";
import ReceiptContainer from "@/app/staking/components/ReceiptContainer";

export default async function Page() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/staking" title="Back to staking">
          Back
        </Link>
      </div>

      <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10 mt-12">
        <div className="sm:col-span-4">
          <ReceiptContainer>My receipt here...</ReceiptContainer>
        </div>
        <div className="sm:col-start-5">
          <StakeAndDelegate />
        </div>
      </HStack>
    </div>
  );
}
