"use client";

import React from "react";
import DelegateCardList, {
  DelegatePaginated,
} from "@/components/Staking/Delegates/DelegateCardList/DelegateCardList";
import SelectDelegatesHeader from "@/components/Staking/Delegates/SelectDelegatesHeader/SelectDelegatesHeader";
import { VStack } from "@/components/Layout/Stack";
import { Delegation } from "@/app/api/common/delegations/delegation";
import InfoBanner from "./InfoBanner";

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

  return (
    <VStack className="mt-12 font-inter">
      <SelectDelegatesHeader />
      <InfoBanner />
      <DelegateCardList
        initialDelegates={initialDelegates}
        fetchDelegates={fetchDelegates}
        fetchDelegators={fetchDelegators}
        selectedDelegateAddress={selectedDelegateAddress}
        setSelectedDelegateAddress={setSelectedDelegateAddress}
      />
    </VStack>
  );
}
