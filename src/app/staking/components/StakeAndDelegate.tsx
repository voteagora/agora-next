"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { StakeButton } from "@/app/staking/components/StakeButton";
import { Input } from "@/components/ui/input";
import Tenant from "@/lib/tenant/tenant";

import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Button } from "@/components/ui/button";

export const StakeAndDelegate = () => {
  const { token } = Tenant.current();
  const { address } = useAccount();

  const [amountToStake, setAmountToStake] = useState<number>(0);
  const [addressToDelegate, setAddressToDelegate] = useState<
    string | undefined
  >(address);

  const { data: totalStaked, isFetched: isLoadedTotalStaked } =
    useDepositorTotalStaked(address as `0x${string}`);

  const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined;

  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(
    address as `0x${string}`
  );
  const hasTokenBalance = isLoadedBalance && tokenBalance !== undefined;

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4">
      <div className="text-center mb-2 text-xs text-slate-600 bg-gray-100 border rounded-xl">
        <div className="rounded-xl bg-white border border-slate-300 p-2">
          <div>Enter {token.symbol} to stake</div>

          <Input
            className="w-full mt-2 text-center"
            placeholder={"0"}
            value={
              amountToStake > 10 ** token.decimals
                ? amountToStake / 10 ** token.decimals
                : amountToStake
            }
            onChange={(e) => {
              setAmountToStake(Math.floor(Number(e.target.value)));
            }}
            type="number"
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

        <div className="gap-8 columns-2">
          <div className="text-left p-2">
            <div className="text-xs">Available to stake</div>
            <div className="text-sm">
              {hasTokenBalance && (
                <TokenAmountDisplay
                  maximumSignificantDigits={5}
                  amount={tokenBalance}
                />
              )}
            </div>
            <div className="text-right p-2">
              <div className="text-xs text-slate-600">Already staked</div>
              <div className="text-sm">
                {hasTotalStaked && (
                  <TokenAmountDisplay
                    maximumSignificantDigits={5}
                    amount={totalStaked}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StakeButton address={addressToDelegate} amount={amountToStake} />
    </div>
  );
};
