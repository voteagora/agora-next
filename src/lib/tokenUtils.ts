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

export function pluralizeVote(count: BigInt) {
  const votes = Number(
    ethers.formatUnits(count.toString(), tokens.get(DEPLOYMENT_NAME)!.decimals)
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

/**
 * Contract calls
 *
 */
export async function getTotalSupply(dao: "OPTIMISM") {
  switch (dao) {
    case "OPTIMISM": {
      return OptimismContracts.token.contract.totalSupply();
    }
  }
}
