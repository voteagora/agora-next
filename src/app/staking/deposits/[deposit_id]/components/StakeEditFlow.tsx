"use client";

import { type DelegatePaginated, type StakedDeposit } from "@/lib/types";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import { BreadcrumbsNav } from "@/app/staking/components/BreadcrumbsNav";
import { HStack } from "@/components/Layout/Stack";
import ReceiptContainer from "@/app/staking/components/ReceiptContainer";
import { Receipt } from "@/app/staking/components/Receipt";
import { SetStakeDialog } from "@/app/staking/components/SetStakeDialog";
import DelegateCardList from "@/app/staking/components/delegates/DelegateCardList";
import { EditStakeConfirm } from "@/app/staking/deposits/[deposit_id]/components/EditStakeConfirm";

const PAGE_TITLE = [
  "Edit your stake",
  "Choose delegate",
  "Confirm your transaction",
];

interface StakeEditFlowProps {
  delegates: DelegatePaginated;
  deposit: StakedDeposit;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
}

export const StakeEditFlow = ({
  deposit,
  fetchDelegates,
  delegates,
}: StakeEditFlowProps) => {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [delegate, setDelegate] = useState<string>(deposit.delegatee);

  return (
    <div>
      <BreadcrumbsNav
        step={step}
        onClick={setStep}
        title={PAGE_TITLE[step - 1]}
        totalSteps={3}
      />

      {step === 1 && (
        <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10">
          <div className="sm:col-span-4">
            <ReceiptContainer>
              <Receipt
                amount={amount}
                delegatee={delegate}
                deposit={deposit}
                depositor={address}
                title={"Editing your stake"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            <SetStakeDialog
              amount={amount}
              deposit={deposit}
              onClick={(amount) => {
                setAmount(amount);
                setStep(2);
              }}
            />
          </div>
        </HStack>
      )}

      {step === 2 && (
        <>
          <div className="border rounded-xl w-full shadow-newDefault p-4 text-sm font-medium">
            Uniswap voters manage staking rewards. Choose your delegate
            carefully to represent you in Uniswap governance.
          </div>
          <DelegateCardList
            address={deposit.depositor}
            amount={amount}
            onSelect={(address) => {
              setDelegate(address);
              setStep(3);
            }}
            initialDelegates={delegates}
            fetchDelegates={fetchDelegates}
          />
        </>
      )}

      {step === 3 && (
        <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10">
          <div className="sm:col-span-4">
            <ReceiptContainer>
              <Receipt
                amount={amount}
                delegatee={delegate}
                deposit={deposit}
                depositor={address}
                title={"Confirm your staking transaction"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            {deposit && amount > 0 ? (
              <EditStakeConfirm amount={amount} deposit={deposit} />
            ) : (
              "Something went wrong!"
            )}
          </div>
        </HStack>
      )}
    </div>
  );
};
