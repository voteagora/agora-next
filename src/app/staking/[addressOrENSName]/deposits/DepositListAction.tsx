"use client";

import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import Tenant from "@/lib/tenant/tenant";
import Link from "next/link";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import React from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface Props {
  address: string;
}

export const DepositListAction = ({ address }: Props) => {
  const { token } = Tenant.current();
  const { data: tokenBalance } = useTokenBalance(address);
  const { data: depositedBalance, isFetched: isDepositFetched } =
    useDepositorTotalStaked(address);

  const hasDepositedBalance = depositedBalance && isDepositFetched;
  const canDepositMore = tokenBalance && tokenBalance > 0n;

  return (
    <div>
      <div className="p-5 flex justify-between text-primary">
        {tokenBalance !== undefined ? (
          <>
            <div className="font-medium">
              {canDepositMore ? (
                <Link href="/staking/new" className="flex gap-2 items-center">
                  <div className="w-8 h-8 border rounded-full items-center justify-center align-baseline mr-2 shadow-newDefault pl-[10px] pt-[2px]">
                    +
                  </div>
                  Deposit another stake
                </Link>
              ) : (
                <>No more {token.symbol} available to stake</>
              )}
            </div>

            <div className="font-light text-secondary">
              <>
                {hasDepositedBalance && (
                  <span className="mr-2">
                    <TokenAmountDecorated amount={depositedBalance} /> staked
                  </span>
                )}
                <TokenAmountDecorated
                  maximumSignificantDigits={4}
                  amount={tokenBalance || 0n}
                  hideCurrency
                />{" "}
                available
              </>
            </div>
          </>
        ) : (
          "Loading token balance..."
        )}
      </div>
    </div>
  );
};
