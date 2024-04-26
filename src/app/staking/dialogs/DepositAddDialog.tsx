"use client";

import Tenant from "@/lib/tenant/tenant";
import React, { useState } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Input } from "@/components/ui/input";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import { Button } from "@/components/ui/button";
import { DepositAddButton } from "@/app/staking/components/DepositAddButton";
import { StakedDeposit } from "@/lib/types";

export function DepositAddDialog({
  deposit,
  closeDialog,
}: {
  deposit: StakedDeposit;
  closeDialog: () => void;
}) {
  const { token } = Tenant.current();
  const [depositAmount, setDepositAmount] = useState<number>(0);

  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(
    deposit.depositor
  );
  const hasMoreTokens = isLoadedBalance && tokenBalance !== undefined;

  if (!hasMoreTokens) {
    return (
      <div className="text-slate-600">Loading {token.symbol} balance...</div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        Delegate more {token.symbol} to{" "}
        <span className="font-medium">
          <HumanAddress address={deposit?.delegatee} />
        </span>
      </div>
      <div className="flex flex-col">
        <Input
          placeholder={"0"}
          value={
            depositAmount > 10 ** token.decimals
              ? depositAmount / 10 ** token.decimals
              : depositAmount
          }
          className="text-center"
          type="number"
          onChange={(e) => {
            setDepositAmount(Math.floor(Number(e.target.value)));
          }}
        />
        <div className="flex justify-end">
          {hasMoreTokens && (
            <Button
              className="text-xs font-light w-400 text-blue-700"
              variant="link"
              onClick={() => setDepositAmount(Number(tokenBalance))}
            >
              Max&nbsp;
              <TokenAmountDisplay
                maximumSignificantDigits={5}
                amount={tokenBalance}
              />
            </Button>
          )}
        </div>
      </div>
      <DepositAddButton
        depositId={deposit.id}
        amount={depositAmount}
        onSuccess={closeDialog}
      />
    </div>
  );
}
