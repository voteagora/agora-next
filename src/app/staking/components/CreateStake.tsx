"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { StakeAndDelegate } from "@/app/staking/components/StakeAndDelegate";
import { HStack } from "@/components/Layout/Stack";
import CreateNewStakeReceipt from "./CreateNewStakeReceipt";
import CreateStakeHeader from "./CreateStakeHeader";

export default function CreateStake() {
  const searchParams = useSearchParams();
  const delegateAddress = searchParams?.get("delegate");

  return (
    <HStack className="grid grid-cols-1 sm:grid-cols-4 gap-5 sm:gap-10 mt-12 font-inter">
      <div className="sm:col-span-4">
        <CreateStakeHeader
          title={
            delegateAddress ? "Confirm your transaction" : "Create your stake"
          }
          step={delegateAddress ? 3 : 1}
        />
      </div>
      <div className="sm:col-span-4">
        <CreateNewStakeReceipt />
      </div>
      <div className="sm:col-start-5">
        <StakeAndDelegate isFirstStep={!!!delegateAddress} />
      </div>
    </HStack>
  );
}
