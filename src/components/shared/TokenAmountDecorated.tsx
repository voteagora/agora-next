import { cn } from "@/lib/utils";
import React from "react";
import TokenAmount from "./TokenAmount";
import Tenant from "@/lib/tenant/tenant";
const { token } = Tenant.current();

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
  decimals = token.decimals,
  currency = token.symbol,
  maximumSignificantDigits = 2,
  hideCurrency = false,
  icon,
  specialFormatting = false,
  className,
}: Props) {
  return (
    <span className={cn(icon ? "flex items-center gap-1" : "", className)}>
      <TokenAmount
        amount={amount}
        decimals={decimals}
        currency={currency}
        maximumSignificantDigits={maximumSignificantDigits}
        specialFormatting={specialFormatting}
        hideCurrency={hideCurrency}
      />
      {icon}
    </span>
  );
}
