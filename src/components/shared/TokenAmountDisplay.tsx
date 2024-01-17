import { formatNumber } from "@/lib/utils";
import { BigNumberish } from "ethers";
import React, { useMemo } from "react";

export default function TokenAmountDisplay({
  amount,
  decimals,
  currency,
  maximumSignificantDigits = 2,
}: {
  amount: BigNumberish;
  decimals: number;
  currency: string;
  maximumSignificantDigits?: number;
}) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, decimals, maximumSignificantDigits);
  }, [amount, decimals, maximumSignificantDigits]);

  return <span>{`${formattedNumber} ${currency}`}</span>;
}
