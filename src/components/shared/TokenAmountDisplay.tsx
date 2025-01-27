import { cn, formatNumber } from "@/lib/utils";
import React, { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { chivoMono } from "@/styles/fonts";
const { token } = Tenant.current();

type Props = {
  amount: string | bigint;
  decimals?: number;
  currency?: string;
  maximumSignificantDigits?: number;
  useChivoMono?: boolean;
  hideCurrency?: boolean;
  icon?: React.ReactNode;
  specialFormatting?: boolean;
};

export default function TokenAmountDisplay({
  amount,
  decimals = token.decimals,
  currency = token.symbol,
  maximumSignificantDigits = 2,
  useChivoMono = false,
  hideCurrency = false,
  icon,
  specialFormatting = false,
}: Props) {
  const formattedNumber = useMemo(() => {
    return formatNumber(
      amount,
      decimals,
      maximumSignificantDigits,
      specialFormatting
    );
  }, [amount, decimals, maximumSignificantDigits, specialFormatting]);

  return (
    <span
      className={cn(
        useChivoMono ? chivoMono.variable : "",
        hideCurrency && icon ? "flex items-center gap-1" : ""
      )}
    >
      {`${formattedNumber} ${hideCurrency ? "" : currency}`}{" "}
      {hideCurrency && icon}
    </span>
  );
}
