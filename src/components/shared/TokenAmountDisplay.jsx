import React, { useMemo } from 'react';

export default function TokenAmountDisplay({
  amount,
  decimals,
  currency,
  maximumSignificantDigits = 2,
}) {
  const formattedNumber = useMemo(() => {
    // Convert the string to a BigInt to handle very large numbers
    const bigIntAmount = BigInt(amount);

    // Create a BigInt representation of the divisor (10 ** decimals)
    const divisor = BigInt(Math.pow(10, decimals));

    // Divide the amount by the divisor and convert to a number for formatting
    const quotient = Number(bigIntAmount / divisor);

    // Format the quotient to the specified number of significant digits
    const roundedNumber = quotient.toFixed(maximumSignificantDigits);

    return roundedNumber;
  }, [amount, decimals, maximumSignificantDigits]);

  return <span>{`${formattedNumber} ${currency}`}</span>;
}
