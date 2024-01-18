import { ethers } from "ethers";
import { OptimismContracts } from "./contracts/contracts";
import { DEPLOYMENT_NAME, Deployments } from "./config";

// TODO: This file seems messy -- consider refactoring

const tokens: Map<
  Deployments,
  { name: string; symbol: string; decimals: number }
> = new Map([
  [
    "optimism",
    {
      name: "Optimism",
      symbol: "OP",
      decimals: 18,
    },
  ],
]);

export const TOKEN = tokens.get(DEPLOYMENT_NAME)!;

const format = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumSignificantDigits: 3,
  notation: "compact",
});

function scientificNotationToBigInt(numStr: any) {
  // Check if the number is in scientific notation
  if (!/\d+\.?\d*e[+-]*\d+/i.test(numStr)) {
    return BigInt(numStr);
  }

  let [base, exponent] = numStr.toLowerCase().split("e");
  exponent = Number(exponent);

  // Remove the decimal point and adjust the exponent
  base = base.replace(".", "");
  exponent -= base.length - 1;

  // Create a BigInt from the adjusted base and exponent
  return BigInt(base + "0".repeat(exponent));
}

export function pluralizeVote(count: BigInt) {
  const decimalCount = scientificNotationToBigInt(count.toString());

  const votes = Number(
    ethers.formatUnits(decimalCount, tokens.get(DEPLOYMENT_NAME)!.decimals)
  );

  if (votes === 1) {
    return "1 vote";
  }
  return `${format
    .formatToParts(votes)
    .map((it) => it.value)
    .join("")} votes`;
}

export function formatNumber(
  amount: string | BigInt,
  maximumSignificantDigits = 4
) {
  const number = Number(
    ethers.formatUnits(amount.toString(), tokens.get(DEPLOYMENT_NAME)!.decimals)
  );

  const numberFormat = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
    compactDisplay: "short",
    notation: "compact",
    maximumSignificantDigits,
  });

  const parts = numberFormat.formatToParts(number);
  return parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");
}

export function formatNumberForAdvancedDelegation(amount: string) {
  // Advanced delegation needs a precision up to 3 decimal places,
  // which is bit different from the formatNumber function used everywhere else and requires for max 4 significant digits
  const number = Number(
    ethers.formatUnits(amount.toString(), tokens.get(DEPLOYMENT_NAME)!.decimals)
  );

  const numberFormat = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
    compactDisplay: "short",
    notation: "compact",
    maximumFractionDigits: 3,
  });

  const parts = numberFormat.formatToParts(number);
  return parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");
}

/**
 * Contract calls
 *
 */
export async function getTokenSupply(dao: "OPTIMISM") {
  switch (dao) {
    case "OPTIMISM": {
      return OptimismContracts.token.contract.totalSupply();
    }
  }
}
