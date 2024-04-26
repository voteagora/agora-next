"use client";

import Tenant from "@/lib/tenant/tenant";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import { Button } from "@/components/ui/button";
import { DepositWithdrawButton } from "@/app/staking/components/DepositWithdrawButton";
import { StakedDeposit } from "@/lib/types";

export function DepositWithdrawDialog({
  deposit,
  closeDialog,
}: {
  deposit: StakedDeposit;
  closeDialog: () => void;
}) {
  const { token } = Tenant.current();
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

  return (
    <div>
      <div className="mb-4">
        Withdraw {token.symbol} delegated{" "}
        <span className="font-medium">
          <HumanAddress address={deposit?.delegatee} />
        </span>
      </div>
      <div className="flex flex-col">
        <Input
          placeholder={"0"}
          value={
            withdrawAmount > 10 ** token.decimals
              ? withdrawAmount / 10 ** token.decimals
              : withdrawAmount
          }
          className="text-center"
          type="number"
          onChange={(e) => {
            setWithdrawAmount(Math.floor(Number(e.target.value)));
          }}
        />
        <div className="flex justify-end">
          <Button
            className="text-xs font-light w-400 text-blue-700"
            variant="link"
            onClick={() => setWithdrawAmount(Number(deposit?.amount))}
          >
            Max&nbsp;
            <TokenAmountDisplay
              maximumSignificantDigits={5}
              amount={deposit?.amount}
            />
          </Button>
        </div>
      </div>
      <DepositWithdrawButton
        id={BigInt(deposit.id)}
        amount={BigInt(withdrawAmount)}
        onSuccess={closeDialog}
      />
    </div>
  );
}
