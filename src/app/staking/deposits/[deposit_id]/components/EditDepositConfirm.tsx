"use client";

import React, { useEffect, useState } from "react";
import Tenant from "@/lib/tenant/tenant";

import { formatNumber, numberToToken } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { StakedDeposit } from "@/lib/types";
import { EditStakeSubmitButton } from "@/app/staking/deposits/[deposit_id]/components/EditStakeSubmitButton";
import { Button } from "@/components/ui/button";

interface EditDepositConfirmProps {
  amount: number;
  deposit: StakedDeposit;
}

export const EditDepositConfirm = ({
  amount,
  deposit,
}: EditDepositConfirmProps) => {
  const router = useRouter();
  const { token, contracts } = Tenant.current();
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        router.replace("/staking");
      }, 3000);
    }
  }, [isConfirmed, router]);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4 shadow-newDefault">
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="text-center text-xs text-gray-600">
          Adding {token.symbol} to existing stake
        </div>

        <div className="w-full text-center bg-white font-bold text-3xl text-black">
          {formatNumber(numberToToken(amount).toString(), token.decimals)}{" "}
          {token.symbol}
        </div>
      </div>
      <div className="text-sm py-4">
        Please verify your transaction details before confirming.
      </div>
      {isConfirmed ? (
        <Button className="w-full" disabled={true}>
          Syncing transaction...
        </Button>
      ) : (
        <EditStakeSubmitButton
          amount={amount}
          deposit={deposit}
          onConfirmed={() => setIsConfirmed(true)}
        />
      )}
    </div>
  );
};
