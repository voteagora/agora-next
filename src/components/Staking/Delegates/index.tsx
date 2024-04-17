"use client";

import React from "react";
import DelegateCardList, {
  DelegatePaginated,
} from "@/components/Staking/Delegates/DelegateCardList/DelegateCardList";
import SelectDelegatesHeader from "@/components/Staking/Delegates/SelectDelegatesHeader/SelectDelegatesHeader";
import { HStack } from "@/components/Layout/Stack";
import SelectedDelegatesFeeCard from "@/components/Staking/Delegates/SelectedDelegatesFeeCard";
import { Delegation } from "@/app/api/common/delegations/delegation";
import TransactionReceipt from "../TransactionReceipt/TransactionReceipt";

interface Props {
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
  fetchDelegators: (addressOrENSName: string) => Promise<Delegation[] | null>;
}

export default async function Delegates({
  initialDelegates,
  fetchDelegates,
  fetchDelegators,
}: Props) {
  const [selectedDelegateAddress, setSelectedDelegateAddress] = React.useState<
    string | null
  >(null);
  const [showReceipt, setShowReceipt] = React.useState<boolean>(false);

  return (
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        {showReceipt ? (
          <TransactionReceipt />
        ) : (
          <>
            <SelectDelegatesHeader />
            <DelegateCardList
              initialDelegates={initialDelegates}
              fetchDelegates={fetchDelegates}
              fetchDelegators={fetchDelegators}
              selectedDelegateAddress={selectedDelegateAddress}
              setSelectedDelegateAddress={setSelectedDelegateAddress}
            />
          </>
        )}
      </div>
      <div className="sm:col-start-5">
        <SelectedDelegatesFeeCard
          setShowReceipt={setShowReceipt}
          selectedDelegateAddress={selectedDelegateAddress}
        />
      </div>
    </HStack>
  );
}
