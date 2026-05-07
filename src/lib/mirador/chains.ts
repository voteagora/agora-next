import { MiradorChainName } from "./types";

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function getMiradorChainNameFromChainId(
  chainId: unknown
): MiradorChainName | undefined {
  const parsedChainId = toOptionalNumber(chainId);
  if (!parsedChainId) {
    return undefined;
  }

  switch (parsedChainId) {
    case 1:
      return "ethereum";
    case 10:
      return "optimism";
    case 56:
      return "bsc";
    case 137:
      return "polygon";
    case 8453:
      return "base";
    case 42161:
      return "arbitrum";
    default:
      return undefined;
  }
}
