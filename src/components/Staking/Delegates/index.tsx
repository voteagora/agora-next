"use client";

import React from "react";
import DelegateCardList, {
  DelegatePaginated,
} from "@/components/Staking/Delegates/DelegateCardList/DelegateCardList";
import SelectDelegatesHeader from "@/components/Staking/Delegates/SelectDelegatesHeader/SelectDelegatesHeader";
import { HStack } from "@/components/Layout/Stack";
import SelectedDelegatesFeeCard from "@/components/Staking/Delegates/SelectedDelegatesFeeCard";
import { Delegation } from "@/app/api/common/delegations/delegation";
import DepositReceipt from "../../../app/staking/components/DepositReceipt";
import { useSearchParams } from "next/navigation";
// import RewardRedemptionCard from "../RewardRedemptionCard";

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
  const searchParams = useSearchParams();
  const isRedeemStakeParam = searchParams?.get("isRedeemStake");

  const [selectedDelegateAddress, setSelectedDelegateAddress] = React.useState<
    string | null
  >(null);
  const [showReceipt, setShowReceipt] = React.useState<boolean>(
    !!isRedeemStakeParam ?? false
  );

  return (
    <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        {showReceipt ? (
          <DepositReceipt />
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
          isShowCollectRewards={!!isRedeemStakeParam}
          buttonText={
            !!isRedeemStakeParam
              ? "Redeem stake and collect rewards"
              : selectedDelegateAddress === null
                ? "Select delegate to continue"
                : showReceipt
                  ? "Stake & delegate my UNI"
                  : "Continue"
          }
          setShowReceipt={setShowReceipt}
          isButtonDisabled={selectedDelegateAddress === null}
        />
        {/* // This component will be shown for claim rewards */}
        {/*
           <RewardRedemptionCard
            buttonText={
              !!isRedeemStakeParam ? "Redeem stake and collect rewards" : ""
            }
            setShowReceipt={setShowReceipt}
            selectedDelegateAddress={selectedDelegateAddress}
          />
          */}
      </div>
    </HStack>
  );
}
