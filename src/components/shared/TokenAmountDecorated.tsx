import { cn } from "@/lib/utils";
import React from "react";
import TokenAmount from "./TokenAmount";
import Tenant from "@/lib/tenant/tenant";

type Props = {
  amount: string | bigint;
  decimals?: number;
  currency?: string;
  maximumSignificantDigits?: number;
  hideCurrency?: boolean;
  icon?: React.ReactNode;
  specialFormatting?: boolean;
  className?: string;
};

export default function TokenAmountDecorated({
  amount,
  decimals,
  currency,
  maximumSignificantDigits = 2,
  hideCurrency = false,
  icon,
  specialFormatting = false,
  className,
}: Props) {
  const { token } = Tenant.current();
  const finalDecimals = decimals ?? token.decimals;
  const finalCurrency = currency ?? token.symbol;
  return (
    <span className={cn(icon ? "flex items-center gap-1" : "", className)}>
      <TokenAmount
        amount={amount}
        decimals={finalDecimals}
        currency={finalCurrency}
        maximumSignificantDigits={maximumSignificantDigits}
        specialFormatting={specialFormatting}
        hideCurrency={hideCurrency}
      />
      {icon}
    </span>
  );
}
