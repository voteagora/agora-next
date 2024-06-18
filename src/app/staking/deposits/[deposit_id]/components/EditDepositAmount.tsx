"use client";

import { type StakedDeposit } from "@/lib/types";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Breadcrumbs } from "@/app/staking/components/Breadcrumbs";
import { HStack } from "@/components/Layout/Stack";
import ReceiptContainer from "@/app/staking/components/receipt/ReceiptContainer";
import { Receipt } from "@/app/staking/components/receipt/Receipt";
import { PanelSetStakeAmount } from "@/app/staking/components/PanelSetStakeAmount";
import { EditDepositConfirm } from "@/app/staking/deposits/[deposit_id]/components/EditDepositConfirm";

const PAGE_TITLE = ["Stake More", "Confirm your transaction"];

interface EditDepositAmountProps {
  deposit: StakedDeposit;
  refreshPath: (path: string) => void;
}

export const EditDepositAmount = ({
  deposit,
  refreshPath,
}: EditDepositAmountProps) => {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
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
            <PanelSetStakeAmount
              amount={amount}
              onChange={(amount) => setAmount(amount)}
              onClick={() => setStep(2)}
            />
          </div>
        </HStack>
      )}

      {step === 2 && (
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
              <EditDepositConfirm
                amount={amount}
                deposit={deposit}
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
