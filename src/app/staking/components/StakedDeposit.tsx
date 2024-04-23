"use client";

import { useStakedDeposit } from "@/hooks/useStakedDeposit";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import HumanAddress from "@/components/shared/HumanAddress";
import {
  DialogProvider,
  useOpenDialog,
} from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

interface StakedDepositProps {
  id: number;
}

export const StakedDeposit = ({ id }: StakedDepositProps) => {
  const openDialog = useOpenDialog();

  const { token } = Tenant.current();
  const { data: deposit, isFetched, isFetching } = useStakedDeposit(id);

  if (!deposit && isFetching) {
    return <div className="text-xs text-slate-600">Loading...</div>;
  }

  if (!deposit?.balance || deposit?.balance === BigInt(0)) {
    return <></>;
  }

  return (
    <DialogProvider>
      <div className="flex justify-evenly rounded-lg border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
        <div className="flex flex-col p-5 min-w-[110px]">
          <div className="text-xs">Staked</div>
          <div className="text-xs font-medium">
            <TokenAmountDisplay
              maximumSignificantDigits={4}
              amount={deposit.balance}
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
                  depositId: id,
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
                  depositId: id,
                },
              });
            }}
          >
            Withdraw
          </Button>
        </div>
      </div>
    </DialogProvider>
  );
};
