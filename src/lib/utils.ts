import { type ClassValue, clsx } from "clsx";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";

const secondsPerBlock = 12;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address: string) {
  return (
    address &&
    [address.substring(0, 4), address.substring(address.length - 4)].join("...")
  );
}

export function bpsToString(bps: number) {
  return `${(Math.round(bps * 100) / 100).toFixed(2)}%`;
}

const format = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumSignificantDigits: 3,
  notation: "compact",
});

export function pluralizeAddresses(count: number) {
  if (count === 1) {
    return "1 address";
  } else {
    return `${format.format(count).toLowerCase()} addresses`;
  }
}

export function formatNumber(
  amount: string | BigInt,
  decimals: number,
  maximumSignificantDigits = 4
) {
  const number = Number(ethers.formatUnits(amount.toString(), decimals));

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
