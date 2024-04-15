"use client";

import React, { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { StakeButton } from "@/app/staking/components/StakeButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tenant from "@/lib/tenant/tenant";

import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { useTotalStaked } from "@/hooks/useTotalStaked";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAgoraContext } from "@/contexts/AgoraContext";

export const StakeDialog = () => {

  const { token, contracts } = Tenant.current();
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const [amountToStake, setAmountToStake] = useState<number>(0);

  const { data: totalStaked, isFetched: isLoadedTotalStaked } = useTotalStaked(address as `0x${string}`);
  const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined;

  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(address as `0x${string}`);
  const hasTokenBalance = isLoadedBalance && tokenBalance !== undefined;


  if (!isConnected || !address) {
    return <Button disabled={true}>Connect Wallet to Stake ${token.symbol}</Button>;
  }

  return <div className="rounded-lg border border-slate-300 w-[400px] p-5">
    <div className="text-center mb-2 text-xs text-slate-600">
      <div> Stake {token.symbol} to earn fees</div>

      <Input className="w-full mt-2 text-center"
             defaultValue={0}
             onChange={(e) => {
               setAmountToStake(Number(e.target.value));
             }}
             type="number" />

    </div>
    <div className="gap-8 columns-2">
      <div className="text-left p-2">
        <div className="text-xs text-slate-600">Available to stake</div>
        <div className="text-sm">
          {hasTokenBalance &&
            <TokenAmountDisplay maximumSignificantDigits={5} amount={tokenBalance} />
          }
        </div>
        <div className="text-right p-2">
          <div className="text-xs text-slate-600">Already staked</div>
          <div className="text-sm">
            {hasTotalStaked &&
              <TokenAmountDisplay maximumSignificantDigits={5} amount={totalStaked} />
            }
          </div>
        </div>
      </div>
    </div>
    <div className="text-xs text-slate-600 py-4">Once your UNI is staked, you will start earning from pools where fees
      are turned on.
    </div>
    <StakeButton address={address} amount={amountToStake} />
  </div>;
};