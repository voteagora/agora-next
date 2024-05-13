import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import Tenant from "@/lib/tenant/tenant";
import Link from "next/link";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import React from "react";

interface DepositListActionProps {
  address: string;
}

export const DepositListAction = ({ address }: DepositListActionProps) => {
  const { token } = Tenant.current();
  const { data: tokenBalance, isFetched } = useTokenBalance(address);
  const { data: depositedBalance, isFetched: isDepositFetched } =
    useDepositorTotalStaked(address);

  const hasTokenBalance = tokenBalance && isFetched;
  const hasDepositedBalance = depositedBalance && isDepositFetched;
  const canDepositMore = hasTokenBalance && tokenBalance > 0n;

  return (
    <div>
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
                  amount={tokenBalance}
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
