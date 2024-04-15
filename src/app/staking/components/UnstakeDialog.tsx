"use client";

import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import React, { useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useTotalStaked } from "@/hooks/useTotalStaked";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UnstakeButton } from "@/app/staking/components/UnstakeButton";
import { useStakedDeposit } from "@/hooks/useStakedDeposit";
import { truncateAddress } from "@/app/lib/utils/text";

export const UnstakeDialog = () => {

  const { token } = Tenant.current();
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const { data: totalStaked, isFetched: isLoadedTotalStaked } = useTotalStaked(address as `0x${string}`);
  const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined;

  const depositId = 20;
  const { data: deposit, isFetched: isDepositFetched } = useStakedDeposit(depositId);

  const hasDeposit = isDepositFetched && deposit?.balance != undefined && deposit.balance > 0;

  if (!isConnected || !address) {
    return <Button disabled={true}>Connect Wallet to Stake ${token.symbol}</Button>;
  }

  return <div className="rounded-lg border border-slate-300 w-[400px] p-5">
    <div className="text-center mb-2 text-xs text-slate-600">
      {hasTotalStaked &&
        <TokenAmountDisplay maximumSignificantDigits={5} amount={totalStaked} />
      }
    </div>

    {!hasDeposit &&
      <div className="text-xs text-slate-600 py-4">
        No deposits found
      </div>
    }

    {hasDeposit && (
      <div>
        <div className="text-xs py-4 text">Unstake {formatNumber(deposit.balance, token.decimals, 6)} {token.symbol}
        </div>

        <div className="text-xs text-slate-600 py-1">Owner {truncateAddress(deposit.owner)}</div>
        <div className="text-xs text-slate-600 py-1 mb-2">Delegatee {truncateAddress(deposit.delegatee)}</div>

        <UnstakeButton id={BigInt(depositId)} amount={deposit.balance} />
      </div>
    )}
  </div>;
};