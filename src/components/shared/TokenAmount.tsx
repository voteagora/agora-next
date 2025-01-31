import { formatNumber } from "@/lib/utils";
import React, { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
const { token } = Tenant.current();

type Props = {
  amount: string | bigint;
  decimals?: number;
  currency?: string;
  maximumSignificantDigits?: number;
  hideCurrency?: boolean;
  specialFormatting?: boolean;
};

export default function TokenAmount({
  amount,
  decimals = token.decimals,
  currency = token.symbol,
  maximumSignificantDigits = 2,
  hideCurrency = false,
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
    <span>{`${formattedNumber}${hideCurrency ? "" : ` ${currency}`}`} </span>
  );
}
