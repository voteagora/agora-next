"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/app/staking/components/Breadcrumbs";
import { HStack } from "@/components/Layout/Stack";
import ReceiptContainer from "@/app/staking/components/receipt/ReceiptContainer";
import { Receipt } from "@/app/staking/components/receipt/Receipt";
import { PanelSetStakeAmount } from "@/app/staking/components/PanelSetStakeAmount";
import { useAccount } from "wagmi";
import DelegateCardList from "@/app/staking/components/delegates/DelegateCardList";
import { NewStakeConfirm } from "@/app/staking/new/components/NewStakeConfirm";
import { PaginatedResultEx } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";

const PAGE_TITLE = [
  "Create your stake",
  "Choose delegate",
  "Confirm your transaction",
];

interface NewStakeFlowProps {
  delegates: PaginatedResultEx<DelegateChunk[]>;
  fetchDelegates: (
    pagination: {
      offset: number;
      limit: number;
    },
    seed: number
  ) => Promise<PaginatedResultEx<DelegateChunk[]>>;
  refreshPath: (path: string) => void;
}

export const NewStakeFlow = ({
  delegates,
  fetchDelegates,
  refreshPath,
}: NewStakeFlowProps) => {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [delegate, setDelegate] = useState<string | undefined>();

  if (!address) {
    return <div>Connect your wallet to stake</div>;
  }

  return (
    <div>
      <Breadcrumbs
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
                depositor={address}
                title={"Creating new stake"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            <PanelSetStakeAmount
              amount={amount}
              onChange={(amount) => setAmount(amount)}
              onClick={() => setStep(2)}
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
            address={address}
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
                depositor={address}
                title={"Confirm your staking transaction"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            {delegate && amount > 0 ? (
              <NewStakeConfirm
                amount={amount}
                depositor={address}
                delegate={delegate}
                refreshPath={refreshPath}
              />
            ) : (
              "Something went wrong!"
            )}
          </div>
        </HStack>
      )}
    </div>
  );
};
