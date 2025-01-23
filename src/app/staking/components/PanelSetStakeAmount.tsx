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
    <div className="rounded-xl border border-line w-[354px] p-4 bg-wash">
      <div className="mb-3 text-center text-xs text-secondary">
        Enter {token.symbol} to stake
      </div>
      <div className="text-center text-sm mb-5 bg-neutral border border-line rounded-lg shadow-newDefault">
        <div className="rounded-lg bg-neutral border-b border-b-line p-2">
          <div className="flex flex-row gap-3 items-center justify-center">
            <Input
              className="w-full text-left border-none bg-neutral font-bold text-3xl text-primary"
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
                  className="text-uppercase bg-neutral text-xs rounded-full border border-line text-secondary w-10 h-10 items-center justify-center shadow-newDefault"
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
          <div className="text-left text-primary">
            <div className="text-xs text-secondary">Available to stake</div>
            {hasTokenBalance && (
              <TokenAmountDisplay
                maximumSignificantDigits={5}
                amount={tokenBalance}
              />
            )}
          </div>
          <div className="border-r border-r-line"></div>
          <div className="text-right text-primary">
            <div className="text-xs text-secondary">Already staked</div>

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
