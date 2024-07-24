import { type ClassValue, clsx } from "clsx";
import { BigNumberish, formatUnits } from "ethers";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";
import Tenant from "./tenant/tenant";
import { TENANT_NAMESPACES } from "./constants";

const { token } = Tenant.current();

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

export const getProposalTypeText = (proposalType: string) => {
  if (Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM) {
    switch (proposalType) {
      case "OPTIMISTIC":
        return "Optimistic Proposal";
      case "STANDARD":
        return "Standard Proposal";
      case "APPROVAL":
        return "Approval Vote Proposal";
      default:
        return "Proposal";
    }
  }
  return "Proposal";
};

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

export function pluralize(word: string, count: number) {
  if (count === 1) {
    return `1 ${word}`;
  }
  let pluralWord = word;
  pluralWord += "s";
  if (word[0] === word[0].toUpperCase()) {
    pluralWord = pluralWord.charAt(0).toUpperCase() + pluralWord.slice(1);
  }
  return `${count} ${pluralWord}`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase();
}

/**
 * Check if a string is in scientific notation
 * @param input
 */
export function isScientificNotation(input: string) {
  const scientificNotationRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;
  return scientificNotationRegex.test(input);
}

/**
 * Convert a string in scientific notation to precision BigInt
 * @param input
 */
export function scientificNotationToPrecision(input: string) {
  if (isScientificNotation(input)) {
    const parts = input.split("e");
    const base = parts[0].replace(".", "");
    const exponent = parseInt(parts[1], 10) - (base.length - 1);
    return BigInt(base) * 10n ** BigInt(exponent);
  } else {
    return BigInt(input);
  }
}

// TODO: Rename ot scientificNotationTo number or something better fitting
export function formatNumberWithScientificNotation(x: number): string {
  if (x === 0) {
    return "0";
  }

  const scientificNotation = x.toExponential();
  const [base, exponent] = scientificNotation.split("e");
  const exp = parseInt(exponent, 10);

  // Format small numbers (abs(x) < 1.0)
  if (Math.abs(x) < 1.0) {
    const leadingZeros = Math.max(0, Math.abs(exp) - 1);
    return `0.${"0".repeat(leadingZeros)}${base.replace(".", "")}`;
  }

  // Format large numbers and numbers with exponent 0
  if (exp >= 0) {
    const [integerPart, fractionalPart] = base.split(".");
    const zerosNeeded = exp - (fractionalPart ? fractionalPart.length : 0);
    return (
      integerPart +
      (fractionalPart || "") +
      "0".repeat(Math.max(zerosNeeded, 0))
    );
  }

  return scientificNotation;
}

export function humanizeNumber(
  n: number,
  options: { delimiter?: string; separator?: string } = {}
): string {
  options = options || {};
  const d = options.delimiter || ",";
  const s = options.separator || ".";
  let result = n.toString().split(".");
  result[0] = result[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + d);
  return result.join(s);
}

export function humanizeNumberContact(n: number, digits: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(n);
}

export function tokenToHumanNumber(amount: number, decimals: number) {
  return Math.floor(amount / Math.pow(10, decimals));
}

export function numberToToken(number: number) {
  const { token } = Tenant.current();
  return BigInt(number * Math.pow(10, token.decimals));
}

export function formatNumber(
  amount: string | BigNumberish,
  decimals: number,
  maximumSignificantDigits = 4
) {
  const standardUnitAmount = Number(formatUnits(amount, decimals));

  const numberFormat = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: maximumSignificantDigits,
  });

  return numberFormat.format(standardUnitAmount);
}

export function TokenAmountDisplay({
  amount,
  decimals = token.decimals,
  currency = token.symbol,
  maximumSignificantDigits = 2,
}: {
  amount: string | BigNumberish;
  decimals?: number;
  currency?: string;
  maximumSignificantDigits?: number;
}) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, decimals, maximumSignificantDigits);
  }, [amount, decimals, maximumSignificantDigits]);

  return `${formattedNumber} ${currency}`;
}

export function generateBarsForVote(
  forVotes: bigint,
  abstainVotes: bigint,
  againstVotes: bigint
) {
  const sections = [
    {
      amount: forVotes,
      value: "for",
      threshold: BigInt(0),
    },
    {
      amount: abstainVotes,
      value: "abstain",
      threshold: BigInt(0),
    },
    {
      amount: againstVotes,
      value: "against",
      threshold: BigInt(0),
    },
  ];

  const bars = 57;
  const result = new Array(bars).fill(""); // Initialize the result array with empty strings

  // Sum of all votes using BigInt
  const totalVotes = sections.reduce(
    (acc, section) => BigInt(acc) + BigInt(section.amount),
    BigInt(0)
  );

  if (totalVotes === BigInt(0)) {
    // If no votes, optionally fill the array with 'abstain' or keep empty
    return result.fill("abstain"); // Default to 'abstain' if no votes are cast
  }

  let accumulatedVotes = BigInt(0);

  // Accumulate votes and calculate the threshold for each section
  sections.forEach((section) => {
    accumulatedVotes += BigInt(section.amount);
    section.threshold = (accumulatedVotes * BigInt(bars)) / totalVotes;
  });

  let currentSection = 0;

  for (let index = 0; index < bars; index++) {
    // Update current section based on index threshold
    while (
      currentSection < sections.length - 1 &&
      BigInt(index) >= sections[currentSection].threshold
    ) {
      currentSection++;
    }
    result[index] = sections[currentSection].value;
  }

  return result;
}

export function formatFullDate(date: Date): string {
  const getOrdinalSuffix = (day: number) => {
    const j = day % 10,
      k = day % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  const day = date.getDate();
  const ordinalDay = `${day}${getOrdinalSuffix(day)}`;

  const formattedDate =
    new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date) +
    ` ${ordinalDay}, ` +
    date.getFullYear();

  return formattedDate;
}

export async function fetchAndSet<T>(
  fetcher: () => Promise<T>,
  setter: (value: T) => void
) {
  const value = await fetcher();
  setter(value);
}

export async function fetchAndSetAll<
  Fetchers extends [() => Promise<any>, ...Array<() => Promise<any>>],
  Setters extends {
    [K in keyof Fetchers]: (value: Awaited<ReturnType<Fetchers[K]>>) => void;
  },
>(fetchers: Fetchers, setters: Setters) {
  const values = await Promise.all(fetchers.map((fetcher) => fetcher()));
  values.forEach((value, index) => setters[index](value));
}

export function getBlockScanAddress(address: string) {
  const { contracts } = Tenant.current();
  const url = contracts.token.chain.blockExplorers?.default.url;
  return `${url}/io/${address}`;
}

export function getBlockScanUrl(hash: string | `0x${string}`) {
  const { contracts } = Tenant.current();
  const url = contracts.token.chain.blockExplorers?.default.url;
  return `${url}/tx/${hash}`;
}

export const getTextWidth = (text: string, font = "14px inter") => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return 0;
};

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const isURL = (value: string) => {
  // Regular expression for URL validation
  const urlRegExp = /^(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-?=%.]+$/i;
  return value === "" || urlRegExp.test(value);
};
