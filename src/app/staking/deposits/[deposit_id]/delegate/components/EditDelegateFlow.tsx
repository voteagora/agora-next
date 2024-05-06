"use client";

import { type DelegatePaginated, type StakedDeposit } from "@/lib/types";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import { BreadcrumbsNav } from "@/app/staking/components/BreadcrumbsNav";
import { HStack } from "@/components/Layout/Stack";
import ReceiptContainer from "@/app/staking/components/ReceiptContainer";
import { Receipt } from "@/app/staking/components/Receipt";
import DelegateCardList from "@/app/staking/components/delegates/DelegateCardList";
import { EditDelegateConfirm } from "@/app/staking/deposits/[deposit_id]/delegate/components/EditDelegateConfirm";
import { tokenToHumanNumber } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

const PAGE_TITLE = ["Edit Delegate", "Confirm your transaction"];

interface EditDelegateFlowProps {
  delegates: DelegatePaginated;
  deposit: StakedDeposit;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
}

export const EditDelegateFlow = ({
  deposit,
  fetchDelegates,
  delegates,
}: EditDelegateFlowProps) => {
  const { token } = Tenant.current();
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [delegate, setDelegate] = useState<string>(deposit.delegatee);

  return (
    <div>
      <BreadcrumbsNav
        step={step}
        onClick={setStep}
        title={PAGE_TITLE[step - 1]}
        totalSteps={2}
      />

      {step === 1 && (
        <>
          <div className="border rounded-xl w-full shadow-newDefault p-4 text-sm font-medium">
            Uniswap voters manage staking rewards. Choose your delegate
            carefully to represent you in Uniswap governance.
          </div>
          <DelegateCardList
            address={deposit.depositor}
            amount={tokenToHumanNumber(Number(deposit.amount), token.decimals)}
            onSelect={(address) => {
              setDelegate(address);
              setStep(2);
            }}
            initialDelegates={delegates}
            fetchDelegates={fetchDelegates}
          />
        </>
      )}

      {step === 2 && (
        <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10">
          <div className="sm:col-span-4">
            <ReceiptContainer>
              <Receipt
                delegatee={delegate}
                deposit={deposit}
                depositor={address}
                title={"Confirm delegate update transaction"}
              />
            </ReceiptContainer>
          </div>
          <div className="sm:col-start-5">
            <EditDelegateConfirm delegate={delegate} deposit={deposit} />
          </div>
        </HStack>
      )}
    </div>
  );
};
