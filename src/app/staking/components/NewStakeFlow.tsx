"use client";

import React, { useState } from "react";
import { BreadcrumbsNav } from "@/app/staking/components/BreadcrumbsNav";
import { HStack } from "@/components/Layout/Stack";
import ReceiptContainer from "@/app/staking/components/ReceiptContainer";
import { Receipt } from "@/app/staking/components/Receipt";
import { SetStakeDialog } from "@/app/staking/components/SetStakeDialog";
import { useAccount } from "wagmi";
import StakingDelegateCardList, {
  DelegateChunk,
} from "@/app/staking/components/StakingDelegateCardList";
import { StakeConfirmDialog } from "@/app/staking/components/StakeConfirmDialog";

interface DelegatePaginated {
  seed: number;
  meta: any;
  delegates: DelegateChunk[];
}

interface NewStakeFlowProps {
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
}

const PAGE_TITLE = [
  "Create your stake",
  "Choose delegate",
  "Confirm your transaction",
];

export const NewStakeFlow = ({
  initialDelegates,
  fetchDelegates,
}: NewStakeFlowProps) => {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [delegate, setDelegate] = useState<string | undefined>();
  const TOTAL_STEPS = 3;

  return (
    <div>
      <BreadcrumbsNav
        step={step}
        setStep={setStep}
        title={PAGE_TITLE[step - 1]}
        totalSteps={TOTAL_STEPS}
      />

      {step === 1 && (
        <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10">
          <div className="sm:col-span-4">
            <ReceiptContainer>
              <Receipt
                amount={amount}
                delegatee={""}
                depositor={address}
                title={"Creating new stake"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            <SetStakeDialog
              amount={amount}
              onClick={(amount) => {
                setAmount(amount);
                setStep(2);
              }}
            />
          </div>
        </HStack>
      )}

      {step === 2 && (
        <StakingDelegateCardList
          onSelect={(address) => {
            setDelegate(address);
            setStep(3);
          }}
          initialDelegates={initialDelegates}
          fetchDelegates={fetchDelegates}
        />
      )}

      {step === 3 && (
        <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10">
          <div className="sm:col-span-4">
            <ReceiptContainer>
              <Receipt
                amount={amount}
                delegatee={delegate}
                depositor={address}
                title={"Confirm your staking transaction"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            {delegate && amount > 0 ? (
              <StakeConfirmDialog amount={amount} address={delegate} />
            ) : (
              "Something went wrong!"
            )}
          </div>
        </HStack>
      )}
    </div>
  );
};
