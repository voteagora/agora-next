"use client";

import { type StakedDeposit } from "@/lib/types";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import { Breadcrumbs } from "@/app/staking/components/Breadcrumbs";
import { HStack } from "@/components/Layout/Stack";
import ReceiptContainer from "@/app/staking/components/receipt/ReceiptContainer";
import { Receipt } from "@/app/staking/components/receipt/Receipt";
import DelegateCardList from "@/app/staking/components/delegates/DelegateCardList";
import { EditDelegateConfirm } from "@/app/staking/deposits/[deposit_id]/delegate/components/EditDelegateConfirm";
import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";

const PAGE_TITLE = ["Edit Delegate", "Confirm your transaction"];

interface EditDelegateFlowProps {
  delegates: PaginatedResult<DelegateChunk[]>;
  deposit: StakedDeposit;
  fetchDelegates: (
    pagination: PaginationParams,
    seed: number
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
  refreshPath: (path: string) => void;
}

export const EditDelegateFlow = ({
  delegates,
  deposit,
  fetchDelegates,
  refreshPath,
}: EditDelegateFlowProps) => {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [delegate, setDelegate] = useState<string>(deposit.delegatee);

  return (
    <div>
      <Breadcrumbs
        step={step}
        onClick={setStep}
        title={PAGE_TITLE[step - 1]}
        totalSteps={2}
      />

      {step === 1 && (
        <>
          <div className="border rounded-xl flex gap-4 w-full shadow-newDefault p-4 font-medium">
            <div className={`p-1 rounded-lg bg-gray-200`}>
              <Image
                src={icons.speakerCone}
                alt="Uniswap voters manage staking rewards"
              />
            </div>
            <>
              Uniswap voters manage staking rewards. Choose your delegate
              carefully to represent you in Uniswap governance.
            </>
          </div>
          <DelegateCardList
            address={deposit.depositor}
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
            <EditDelegateConfirm
              delegate={delegate}
              deposit={deposit}
              refreshPath={refreshPath}
            />
          </div>
        </HStack>
      )}
    </div>
  );
};
