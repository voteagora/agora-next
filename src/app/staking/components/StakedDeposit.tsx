"use client";


import { useStakedDeposit } from "@/hooks/useStakedDeposit";
import { formatNumber } from "@/lib/utils";
import { UnstakeButton } from "@/app/staking/components/UnstakeButton";
import React from "react";
import Tenant from "@/lib/tenant/tenant";

interface StakedDepositProps {
  id: number;
}

export const StakedDeposit = ({ id }: StakedDepositProps) => {

  const { token } = Tenant.current();
  const { data: deposit, isFetched, isFetching,  } = useStakedDeposit(id);

  if (!deposit && isFetching) {
    return <div className="text-xs text-slate-600">Loading...</div>;
  }

  if (!deposit?.balance || deposit?.balance === BigInt(0)) {
    return;
  }

  return (<div>
    {deposit && (
      <div>

        <div className="text-xs py-4 font-medium">Deposit {id}</div>
        <div
          className="text-xs text-slate-600 py-1 mb-2">Delegated {formatNumber(deposit.balance, token.decimals, token.decimals)} {token.symbol} to {deposit.delegatee}</div>

        <UnstakeButton id={BigInt(id)} amount={deposit.balance} />
      </div>
    )}
  </div>);
};