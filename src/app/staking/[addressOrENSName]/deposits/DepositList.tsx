"use client";

import React from "react";
import { StakedDeposit } from "@/lib/types";
import type { Delegate } from "@/app/api/common/delegates/delegate";
import { Deposit } from "@/app/staking/[addressOrENSName]/deposits/Deposit";
import { DepositListAction } from "@/app/staking/[addressOrENSName]/deposits/DepositListAction";

interface StakedDepositListProps {
  deposits: StakedDeposit[];
  fetchDelegate: (address: string) => Promise<Delegate>;
  refreshPath: (path: string) => void;
}

export const DepositList = ({
  deposits,
  fetchDelegate,
  refreshPath,
}: StakedDepositListProps) => {
  return (
    <div className="flex flex-col rounded-xl border border-line w-auto h-100 bg-wash shadow-newDefault">
      <div className="border-b border-line rounded-xl bg-neutral shadow-newDefault">
        {deposits.map(async (deposit) => {
          return (
            <div key={`deposit-${deposit.id}`} className="flex w-auto h-100">
              <Deposit
                deposit={deposit}
                fetchDelegate={fetchDelegate}
                refreshPath={refreshPath}
              />
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
