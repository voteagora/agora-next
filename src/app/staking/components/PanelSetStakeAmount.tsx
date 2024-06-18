"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";

import { Input } from "@/components/ui/input";
import Tenant from "@/lib/tenant/tenant";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Button } from "@/components/ui/button";
import { tokenToHumanNumber } from "@/lib/utils";

interface PanelSetStakeAmountProps {
  amount: number;
  onChange: (value: number) => void;
  onClick: () => void;
}

export const PanelSetStakeAmount = ({
  amount: defaultAmount,
  onChange,
  onClick,
}: PanelSetStakeAmountProps) => {
  const { token } = Tenant.current();
  const { address } = useAccount();

  const [amount, setAmount] = useState<number>(defaultAmount);

  const { data: totalStaked, isFetched: isLoadedTotalStaked } =
    useDepositorTotalStaked(address as `0x${string}`);
  const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined;
  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(
    address as `0x${string}`
  );
  const hasTokenBalance = isLoadedBalance && tokenBalance !== undefined;

  const hasValidAmount =
    amount > 0 &&
    amount <= tokenToHumanNumber(Number(tokenBalance), token.decimals);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4">
      <div className="mb-3 text-center text-xs text-gray-600">
        Enter {token.symbol} to stake
      </div>
      <div className="text-center text-sm mb-5 bg-gray-100 border border-slate-300 rounded-lg shadow-newDefault">
        <div className="rounded-lg bg-white border-b border-b-slate-300 p-2">
          <div className="flex flex-row gap-3 items-center justify-center">
            <Input
              className="w-full text-left border-none bg-white font-bold text-3xl text-black"
              placeholder={`0 ${token.symbol}`}
              value={amount > 0 ? amount : ""}
              onChange={(e) => {
                onChange(Number(e.target.value));
                setAmount(Number(e.target.value));
              }}
              type="number"
            />

            <div className="w-10">
              {hasTokenBalance && (
                <Button
                  className="text-uppercase bg-white text-xs rounded-full border w-10 h-10 items-center justify-center shadow-newDefault"
                  variant="secondary"
                  onClick={() => {
                    const maxAmount = tokenToHumanNumber(
                      Number(tokenBalance),
                      token.decimals
                    );

                    setAmount(maxAmount);
                    onChange(maxAmount);
                  }}
                >
                  MAX
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 justify-between py-3 px-2">
          <div className="text-left">
            <div className="text-xs text-gray-600">Available to stake</div>
            {hasTokenBalance && (
              <TokenAmountDisplay
                maximumSignificantDigits={5}
                amount={tokenBalance}
              />
            )}
          </div>
          <div className="border-r border-r-slate-300"></div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Already staked</div>

            {hasTotalStaked && (
              <TokenAmountDisplay
                maximumSignificantDigits={5}
                amount={totalStaked}
              />
            )}
          </div>
        </div>
      </div>
      <Button className="w-full " disabled={!hasValidAmount} onClick={onClick}>
        Continue
      </Button>
    </div>
  );
};
