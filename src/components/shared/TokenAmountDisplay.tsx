import { formatNumber } from "@/lib/utils";
import { BigNumberish } from "ethers";
import React, { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
const { token } = Tenant.current();

export default function TokenAmountDisplay({
  amount,
  decimals = token.decimals,
  currency = token.symbol,
  maximumSignificantDigits = 2,
}: {
  amount: BigNumberish;
  decimals?: number;
  currency?: string;
  maximumSignificantDigits?: number;
}) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, decimals, maximumSignificantDigits);
  }, [amount, decimals, maximumSignificantDigits]);

  return <span>{`${formattedNumber} ${currency}`}</span>;
}
