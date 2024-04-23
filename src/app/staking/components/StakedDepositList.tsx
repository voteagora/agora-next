"use client";

import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import HumanAddress from "@/components/shared/HumanAddress";
import { DialogProvider, useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";

interface StakedDepositListProps {
  address: string;
}

export const StakedDepositList = async ({ address }: StakedDepositListProps) => {
  const openDialog = useOpenDialog();
  const { token } = Tenant.current();

  const deposits = await apiFetchStakedDeposits({ address });

  if (!deposits) {
    return <div className="text-xs text-slate-600 py-4">
      Loading deposits...
    </div>;
  }

  return (
    <DialogProvider>
      {deposits.map((deposit) => {

        return <div key={`deposit-${deposit.id}`}
                    className="flex justify-evenly rounded-lg border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
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

          <div className="border-r border-gray-300"></div>

          <div className="flex flex-col p-5">
            <Button
              onClick={(event) => {
                openDialog({
                  type: "STAKE_DEPOSIT_ADD",
                  params: {
                    depositId: deposit.id,
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
              onClick={(event) => {
                openDialog({
                  type: "STAKE_DEPOSIT_WITHDRAW",
                  params: {
                    depositId: deposit.id,
                  },
                });
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>;
      })}
    </DialogProvider>
  );
};
