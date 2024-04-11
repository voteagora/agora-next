"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { StakeButton } from "@/app/staking/components/StakeButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tenant from "@/lib/tenant/tenant";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

export const StakeDialog = async () => {

  const { token, contracts } = Tenant.current();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<number>(0);

  const totalStaked = await contracts.staker?.contract.depositorTotalStaked(address as `0x${string}`);
  const availableToStake = await contracts.token.contract.balanceOf(address as `0x${string}`);

  if (!isConnected || !address) {
    return <Button disabled={true}>Connect Wallet to Stake ${token.symbol}</Button>;
  }

  return <div className="rounded-lg border border-slate-300 w-[400px] p-5">
    <div className="text-center mb-2 text-xs text-slate-600">
      <div> Stake {token.symbol} to earn fees</div>

      <Input className="w-full mt-2 text-center"
             defaultValue={0}
             type="number"
      />

      <div className="flex justify-end">
        <button className="text-blue-500" onClick={() => setAmount(Number(availableToStake))}>Max</button>
      </div>
    </div>
    <div className="gap-8 columns-2">
      <div className="text-left p-2">
        <div className="text-xs text-slate-600">Available to stake</div>
        <div className="text-sm"><TokenAmountDisplay maximumSignificantDigits={5} amount={availableToStake || BigInt(0)} /></div>
      </div>
      <div className="text-right p-2">
        <div className="text-xs text-slate-600">Already staked</div>
        {totalStaked !== undefined && (
          <div className="text-sm"><TokenAmountDisplay maximumSignificantDigits={5} amount={totalStaked || BigInt(0)} /></div>
        )
        }
      </div>
    </div>
    <div className="text-xs text-slate-600 py-4">Once your UNI is staked, you will start earning from pools where fees
      are turned on.
    </div>
    <StakeButton address={address} amount={100_000} />
  </div>;


};