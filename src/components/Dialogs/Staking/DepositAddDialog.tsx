"use client";

import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Input } from "@/components/ui/input";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { useStakedDeposit } from "@/hooks/useStakedDeposit";
import HumanAddress from "@/components/shared/HumanAddress";
import { Button } from "@/components/ui/button";
import { StakeMoreButton } from "@/app/staking/components/StakeMoreButton";

export function DepositAddDialog({
  depositId,
  closeDialog,
}: {
  depositId: number;
  closeDialog: () => void;
}) {
  const { token } = Tenant.current();
  const { address } = useAccount();
  const [amountToStake, setAmountToStake] = useState<number>(0);

  const { data: deposit, isFetched, isFetching } = useStakedDeposit(depositId);
  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(
    address as `0x${string}`
  );

  const hasTokenBalance = isLoadedBalance && tokenBalance !== undefined;

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
          className="text-center"
          type="number"
          onChange={(e) => {
            setAmountToStake(Number(e.target.value));
          }}
        />
        <div className="flex justify-end">
          {hasTokenBalance && (
            <Button
              className="text-xs font-light w-400 text-blue-700"
              variant="link"
              onClick={() => setAmountToStake(Number(tokenBalance))}
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
      <StakeMoreButton
        depositId={depositId}
        amount={amountToStake}
        onSuccess={closeDialog}
      />
    </div>
  );
}
