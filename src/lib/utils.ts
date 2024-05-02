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
    (acc, section) => acc + BigInt(section.amount),
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

// TODO: Move this into tenant.ts
export function getBlockScanUrl(hash: string | `0x${string}`) {
  switch (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME) {
    case "optimism":
      return `https://optimistic.etherscan.io/tx/${hash}`;

    default:
      return `https://etherscan.io/tx/${hash}`;
  }
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
