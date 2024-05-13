"use client";

import React from "react";
import { StakedDeposit } from "@/lib/types";
import type { Delegate } from "@/app/api/common/delegates/delegate";
import { Deposit } from "@/app/staking/components/deposits/Deposit";
import { DepositListAction } from "@/app/staking/components/deposits/DepositListAction";

interface StakedDepositListProps {
  deposits: StakedDeposit[];
  fetchDelegate: (address: string) => Promise<Delegate>;
}

export const DepositList = ({
  deposits,
  fetchDelegate,
}: StakedDepositListProps) => {
  return (
    <div className="flex flex-col rounded-xl border border-gray-300 w-auto h-100 bg-gray-50 shadow-newDefault">
      <div className="border-b border-gray-300 rounded-xl bg-white shadow-newDefault">
        {deposits.map(async (deposit, idx) => {
          return (
            <div key={`deposit-${deposit.id}`} className="flex w-auto h-100">
              <Deposit deposit={deposit} fetchDelegate={fetchDelegate} />
            </div>
          );
        })}
      </div>
      {deposits.length > 0 && (
        <DepositListAction address={deposits[0].depositor} />
      )}
    </div>
  );
};
