"use client";

import React from "react";
import HumanAddress from "@/components/shared/HumanAddress";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { StakedDeposit } from "@/lib/types";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import Link from "next/link";
import { Button } from "@/components/Button";
import { HStack } from "@/components/Layout/Stack";
import { DepositWithdrawButton } from "@/app/staking/components/DepositWithdrawButton";

interface StakedDepositListProps {
  deposits: StakedDeposit[];
  address: string;
}

export const StakedDepositList = ({
  deposits,
  address,
}: StakedDepositListProps) => {
  const { data, isFetched } = useTokenBalance(address);
  const hasTokenBalance = data && isFetched;
  const canDepositMode = hasTokenBalance && data > 0n;

  return (
    <DialogProvider>
      <div className="flex flex-col rounded-xl border border-gray-300 w-auto h-100 bg-gray-50 shadow-newDefault">
        <div className="border-b border-gray-300 rounded-xl bg-white shadow-newDefault">
          {deposits.map((deposit, idx) => {
            return (
              <div
                key={`deposit-${deposit.id}`}
                className={`flex w-auto h-100 ${idx < deposits.length - 1 ? "border-b border-b-gray-300" : ""}`}
              >
                <div className="flex flex-col p-5 min-w-[140px]">
                  <div className="text-xs font-medium text-gray-700">
                    Staked
                  </div>
                  <div className="font-medium">
                    <TokenAmountDisplay
                      maximumSignificantDigits={4}
                      amount={deposit.amount}
                    />
                  </div>
                </div>

                <div className="border-r border-gray-300"></div>

                <div className="flex flex-col p-5">
                  <HStack>
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        Vote delegated to
                      </div>
                      <div className="font-medium">
                        <HumanAddress address={deposit.delegatee} />
                      </div>
                    </div>
                    <Button href={`/staking/deposits/${deposit.id}`}>
                      Manage deposit
                    </Button>
                    <DepositWithdrawButton
                      id={BigInt(deposit.id)}
                      amount={BigInt(deposit.amount)}
                      onSuccess={() => {}}
                    />
                  </HStack>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-5 flex justify-between">
          {hasTokenBalance ? (
            <>
              <div className="font-medium">
                {canDepositMode ? (
                  <Link href="staking/new">Deposit another stake</Link>
                ) : (
                  <>No more stakes available</>
                )}
              </div>

              <div className="font-light text-gray-600">
                <TokenAmountDisplay
                  maximumSignificantDigits={4}
                  amount={data}
                />{" "}
                available
              </div>
            </>
          ) : (
            "Loading token balance..."
          )}
        </div>
      </div>
    </DialogProvider>
  );
};
