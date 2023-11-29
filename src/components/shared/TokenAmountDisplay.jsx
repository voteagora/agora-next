import { formatNumber } from "@/lib/utils";
import React, { useMemo } from "react";

export default function TokenAmountDisplay({
  amount,
  decimals,
  currency,
  maximumSignificantDigits = 2,
}) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, decimals, maximumSignificantDigits);
  }, [amount, decimals, maximumSignificantDigits]);
  return <span>{`${formattedNumber} ${currency}`}</span>;
}
