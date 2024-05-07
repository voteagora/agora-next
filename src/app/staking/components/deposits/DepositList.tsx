"use client";

import React from "react";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { StakedDeposit } from "@/lib/types";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import type { Delegate } from "@/app/api/common/delegates/delegate";
import { Deposit } from "@/app/staking/components/deposits/Deposit";
import Tenant from "@/lib/tenant/tenant";

interface StakedDepositListProps {
  deposits: StakedDeposit[];
  fetchDelegate: (address: string) => Promise<Delegate>;
}

export const DepositList = ({
  deposits,
  fetchDelegate,
}: StakedDepositListProps) => {
  const { token } = Tenant.current();
  const { address } = useAccount();
  const { data, isFetched } = useTokenBalance(address);
  const { data: depositedBalance, isFetched: isDepositFetched } =
    useDepositorTotalStaked(address);
  const hasTokenBalance = data && isFetched;
  const hasDepositedBalance = depositedBalance && isDepositFetched;
  const canDepositMore = hasTokenBalance && data > 0n;

  return (
    <div className="flex flex-col rounded-xl border border-gray-300 w-auto h-100 bg-gray-50 shadow-newDefault">
      <div className="border-b border-gray-300 rounded-xl bg-white shadow-newDefault">
        {deposits.map(async (deposit, idx) => {
          return (
            <div key={`deposit-${deposit.id}`} className="flex w-auto h-100">
              <Deposit deposit={deposit} fetchDelegate={fetchDelegate} />
            </div>
          );
        })}
      </div>
      <div className="p-5 flex justify-between">
        {hasTokenBalance ? (
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
                <>No more ${token.symbol} available to stake</>
              )}
            </div>

            <div className="font-light text-gray-600">
              <>
                {hasDepositedBalance && (
                  <span className="mr-2">
                    <TokenAmountDisplay amount={depositedBalance} /> staked
                  </span>
                )}
                <TokenAmountDisplay
                  maximumSignificantDigits={4}
                  amount={data}
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
