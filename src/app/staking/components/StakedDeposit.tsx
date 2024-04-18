"use client";

import { useStakedDeposit } from "@/hooks/useStakedDeposit";
import { formatNumber } from "@/lib/utils";
import { WithdrawButton } from "@/app/staking/components/WithdrawButton";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import HumanAddress from "@/components/shared/HumanAddress";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface StakedDepositProps {
  id: number;
}

export const StakedDeposit = async ({ id }: StakedDepositProps) => {
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
    <div className="flex justify-evenly rounded-lg border border-gray-300 w-auto h-100 mb-4 bg-gray-50">
      <div className="flex flex-col p-5">
        <div className="text-xs">Staked</div>
        <div className="text-xs font-medium">{`${formatNumber(deposit.balance, token.decimals, token.decimals)} ${token.symbol}`}</div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col p-5">
        <div className="text-xs">Vote delegated to</div>
        <div className="text-xs font-medium">
          <HumanAddress address={deposit.delegatee} />
        </div>
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col p-5">
        <WithdrawButton id={BigInt(id)} amount={deposit.balance} />
      </div>

      <div className="border-r border-gray-300"></div>

      <div className="flex flex-col p-5">
        <Button
          onClick={() => {
            openDialog({
              type: "STAKE_DEPOSIT_MORE",
              params: {
                delegate: deposit?.delegatee,
                depositId: id,
              },
            });
          }}
        >
          Add More
        </Button>
      </div>
    </div>
  );
};
