import { type ClassValue, clsx } from "clsx";
import { BigNumberish, formatUnits } from "ethers";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";

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

export const getProposalTypeText = (proposalType: string) => {
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

export function TokenAmountDisplay(
  amount: string | BigNumberish,
  decimals: number,
  currency: string,
  maximumSignificantDigits = 2
) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, decimals, maximumSignificantDigits);
  }, [amount, decimals, maximumSignificantDigits]);

  return `${formattedNumber} ${currency}`;
}

export function* generateBarsForVote(
  forVotes: bigint,
  abstainVotes: bigint,
  againstVotes: bigint
) {
  const sections = [
    {
      amount: forVotes,
      value: "for" as const,
    },
    {
      amount: abstainVotes,
      value: "abstain" as const,
    },
    {
      amount: againstVotes,
      value: "against" as const,
    },
  ];

  const defaultSectionIndex = 1;

  const bars = 57;

  // Sum of all votes using BigInt
  const totalVotes = sections.reduce(
    (acc, section) => acc + section.amount,
    BigInt(0)
  );

  for (let index = 0; index < bars; index++) {
    if (totalVotes === BigInt(0)) {
      yield sections[defaultSectionIndex].value;
    } else {
      const value = (totalVotes * BigInt(index)) / BigInt(bars);

      let lastSectionValue = BigInt(0);
      for (const section of sections) {
        const sectionAmount = section.amount;
        if (value < lastSectionValue + sectionAmount) {
          yield section.value;
          break;
        }

        lastSectionValue += sectionAmount;
      }
    }
  }
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
  }
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
