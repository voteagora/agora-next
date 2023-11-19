import { ethers } from "ethers";
import { OptimismContracts } from "./contracts/contracts";

export const tokens = {
  optimism: {
    name: "Optimism",
    symbol: "OP",
    decimals: 18,
  },
};

const format = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumSignificantDigits: 3,
  notation: "compact",
});

export function pluralizeVote(count: BigInt, token: keyof typeof tokens) {
  const votes = Number(
    ethers.formatUnits(count.toString(), tokens[token].decimals)
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
  token: keyof typeof tokens,
  maximumSignificantDigits = 4
) {
  const number = Number(
    ethers.formatUnits(amount.toString(), tokens[token].decimals)
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
export async function getVotableSupply(dao: "OPTIMISM") {
  switch (dao) {
    case "OPTIMISM": {
      return OptimismContracts.token.contract.totalSupply();
    }
  }
}
