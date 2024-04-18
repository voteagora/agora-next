import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Input } from "@/components/ui/input";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { StakeButton } from "@/app/staking/components/StakeButton";
import { useStakedDeposit } from "@/hooks/useStakedDeposit";
import HumanAddress from "@/components/shared/HumanAddress";
import { Button } from "@/components/ui/button";

export function DepositMoreDialog({
  delegate,
  depositId,
  closeDialog,
}: {
  delegate: string;
  depositId: number;
  closeDialog: () => void;
}) {
  const { token } = Tenant.current();
  const { address } = useAccount();

  const [amountToStake, setAmountToStake] = useState<number>(0);
  const [addressToDelegate, setAddressToDelegate] = useState<
    string | undefined
  >(delegate);

  const { data: deposit, isFetched, isFetching } = useStakedDeposit(depositId);
  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(
    address as `0x${string}`
  );
  const hasTokenBalance = isLoadedBalance && tokenBalance !== undefined;

  return (
    <div>
      <div className="mb-4">
        Delegate more {token.symbol} to{" "}
        <HumanAddress address={deposit?.delegatee} />
      </div>
      <div className="flex flex-col">
        <Input
          className="text-center"
          defaultValue={0}
          value={amountToStake}
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

      {!addressToDelegate && "Must choose delegate"}
      {addressToDelegate && (
        <StakeButton address={addressToDelegate} amount={amountToStake} />
      )}
    </div>
  );
}
