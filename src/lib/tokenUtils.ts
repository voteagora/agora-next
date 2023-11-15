import { ethers } from "ethers";

const tokens = {
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
