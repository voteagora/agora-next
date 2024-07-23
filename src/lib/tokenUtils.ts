import { ethers } from "ethers";
import Tenant from "@/lib/tenant/tenant";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";

// TODO: This file seems messy -- consider refactoring

const format = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumSignificantDigits: 3,
  notation: "compact",
});

export const tokenForContractAddress = (address: string) => {
  switch (address) {
    case "0x42000000000000000000000000000000000000420":
      return TenantTokenFactory.create("optimism");

    default:
      return TenantTokenFactory.create("optimism");
  }
};

export function pluralizeVote(count: BigInt) {
  const { token } = Tenant.current();

  const votes = Number(ethers.formatUnits(count.toString(), token.decimals));

  if (votes === 1) {
    return "1 vote";
  }
  return `${format
    .formatToParts(votes)
    .map((it) => it.value)
    .join("")} votes`;
}

export function pluralizeSnapshotVote(count: bigint) {
  if (count == 1n) {
    return `1 vote`;
  } else {
    return `${format
      .formatToParts(count)
      .map((it) => it.value)
      .join("")} votes`;
  }
}

export function formatNumber(
  amount: string | BigInt,
  maximumSignificantDigits = 4
) {
  const { token } = Tenant.current();
  const number = Number(ethers.formatUnits(amount.toString(), token.decimals));

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

  const { token } = Tenant.current();

  const number = Number(ethers.formatUnits(amount.toString(), token.decimals));

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
