"use client";

import React from "react";
import HumanAddress from "@/components/shared/HumanAddress";
import {
  DialogProvider,
  useOpenDialog,
} from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { StakedDeposit } from "@/lib/types";
import { Button } from "@/components/Button";

interface StakedDepositListProps {
  deposits: StakedDeposit[];
}

export const StakedDepositList = ({ deposits }: StakedDepositListProps) => {
  const openDialog = useOpenDialog();

  return (
    <DialogProvider>
      <div className="flex flex-col gap-2">
        {deposits.map((deposit) => {
          return (
            <div
              key={`deposit-${deposit.id}`}
              className="flex justify-evenly rounded-lg border border-gray-300 w-auto h-100 mb-4 bg-gray-50"
            >
              <div className="flex flex-col p-5 min-w-[110px]">
                <div className="text-xs">Staked</div>
                <div className="text-xs font-medium">
                  <TokenAmountDisplay
                    maximumSignificantDigits={4}
                    amount={deposit.amount}
                  />
                </div>
              </div>

              <div className="border-r border-gray-300"></div>

              <div className="flex flex-col p-5 min-w-[200px]">
                <div className="text-xs">Vote delegated to</div>
                <div className="text-xs font-medium">
                  <HumanAddress address={deposit.delegatee} />
                </div>
              </div>
              {deposit.delegatee}
              {" - "}
              {deposit.depositor}

              <div className="border-r border-gray-300"></div>

              <div className="flex flex-col p-5">
                <Button
                  onClick={() => {
                    openDialog({
                      type: "STAKE_DEPOSIT_ADD",
                      params: {
                        deposit: deposit,
                      },
                    });
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="border-r border-gray-300"></div>

              <div className="flex flex-col p-5">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    openDialog({
                      type: "STAKE_DEPOSIT_WITHDRAW",
                      params: {
                        deposit: deposit,
                      },
                    });
                  }}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </DialogProvider>
  );
};
