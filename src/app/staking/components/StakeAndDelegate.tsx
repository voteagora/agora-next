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
    <div className="rounded-lg border border-slate-300 w-[400px] p-5">
      <div className="text-center mb-2 text-xs text-slate-600">
        <div>
          <div>Stake {token.symbol} to earn fees</div>

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
        </div>
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

        <div className="py-4">
          <div>Delegate</div>
          <Input
            className="w-full mt-2 text-center"
            defaultValue={address}
            onChange={(e) => {
              setAddressToDelegate(e.target.value);
            }}
            type="text"
          />
        </div>
      </div>

      <div className="gap-8 columns-2">
        <div className="text-left p-2">
          <div className="text-xs text-slate-600">Available to stake</div>
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
      <div className="text-xs text-slate-600 py-4">
        Once your UNI is staked, you will start earning from pools where fees
        are turned on.
      </div>

      <StakeButton address={addressToDelegate} amount={amountToStake} />
    </div>
  );
};
