import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";
import Tenant from "./tenant/tenant";
import { fallback, http } from "wagmi";
import {
  DERIVE_MAINNET_RPC,
  DERIVE_TESTNET_RPC,
} from "@/lib/tenant/configs/contracts/derive";
import { ProposalType } from "../app/proposals/draft/types";
import { AlchemyProvider } from "ethers";
import {
  Address,
  hexToBigInt,
  WaitForTransactionReceiptParameters,
  WaitForTransactionReceiptReturnType,
} from "viem";
import { unstable_cache } from "next/cache";
import { ParsedProposalData } from "./proposalUtils";
import { getPublicClient } from "./viem";
import {
  arbitrum,
  base,
  goerli,
  mainnet,
  optimism,
  polygon,
  scroll,
  sepolia,
} from "viem/chains";

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

export const getProposalTypeText = (
  proposalType: string,
  proposalData?: ParsedProposalData["SNAPSHOT"]["kind"]
) => {
  switch (proposalType) {
    case "OPTIMISTIC":
      return "Optimistic Proposal";
    case "STANDARD":
      return "Standard Proposal";
    case "APPROVAL":
      return "Approval Vote Proposal";
    case "SNAPSHOT":
      if (proposalData?.type === "copeland") {
        return "Ranked Choice Proposal";
      }
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      return "Optimistic Proposal (Offchain)";
    case "OFFCHAIN_STANDARD":
      return "Standard Proposal (Offchain)";
    case "OFFCHAIN_APPROVAL":
      return "Approval Vote Proposal (Offchain)";
    case "HYBRID_STANDARD":
      return "Joint House Standard Proposal";
    case "HYBRID_APPROVAL":
      return "Joint House Approval Proposal";
    case "HYBRID_OPTIMISTIC_TIERED":
      return "Joint House Optimistic Proposal";
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

export function formatPercentageWithPrecision(
  value: number,
  precision: number
) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(precision);
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
  amount: string | bigint,
  decimals: number,
  maximumSignificantDigits = 4,
  useSpecialFormatting?: boolean,
  useCompactDisplay = true
) {
  let bigIntAmount: bigint;

  if (typeof amount === "string") {
    // Handle potential scientific notation
    if (amount.includes("e")) {
      bigIntAmount = scientificNotationToPrecision(amount);
    } else {
      bigIntAmount = BigInt(amount);
    }
  } else {
    // Ensure amount is converted to BigInt if it's a number
    bigIntAmount = typeof amount === "number" ? BigInt(amount) : (amount ?? 0n);
  }

  // Convert to standard unit
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = bigIntAmount / divisor;
  const fractionalPart = bigIntAmount % divisor;

  // Convert to number for formatting
  const standardUnitAmount =
    Number(wholePart) + Number(fractionalPart) / Number(divisor);

  if (useSpecialFormatting) {
    if (standardUnitAmount === 0) return "";
    if (standardUnitAmount >= 1.5) {
      const rounded = Math.round(standardUnitAmount);
      return new Intl.NumberFormat("en", {
        maximumFractionDigits: 0,
      }).format(rounded);
    }
    if (standardUnitAmount >= 1) return "~1";
    if (standardUnitAmount > 0) return "<1";
  }

  const numberFormat = new Intl.NumberFormat("en", {
    notation: useCompactDisplay ? "compact" : "standard",
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
  amount: string | bigint;
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
  return `${url}/address/${address}`;
}

export function getBlockScanUrl(hash: string | `0x${string}`, isEas?: boolean) {
  const chainId = Tenant.current().contracts.token.chain.id;
  if (isEas) {
    switch (chainId) {
      case 10:
        return `https://optimism.easscan.org/attestation/view/${hash}`;
      case 11155420:
        return `https://optimism-sepolia.easscan.org/attestation/view/${hash}`;
      default:
        return `https://optimism.easscan.org/attestation/view/${hash}`;
    }
  }
  const { contracts } = Tenant.current();
  const url = contracts.token.chain.blockExplorers?.default.url;
  return `${url}/tx/${hash}`;
}

export function getBlockScanRawUrl() {
  const { contracts } = Tenant.current();
  const url = contracts.token.chain.blockExplorers?.default.url;
  return url;
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

const FORK_NODE_URL = process.env.NEXT_PUBLIC_FORK_NODE_URL!;

export function toNumericChainId(
  // Normalize chain.id to a number even if it's a CAIP-2 string (e.g., "eip155:11155420")
  // This format is relevant when using a wallet connect provider
  input: number | string | { id: number | string }
): number {
  const raw =
    typeof input === "object" && input !== null ? (input as any).id : input;

  if (typeof raw === "number") return raw;

  // Handle CAIP-2 strings like "eip155:11155420" or any "namespace:reference"
  const parts = String(raw).split(":");
  const maybeId = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const id = Number(maybeId);

  if (Number.isNaN(id)) {
    throw new Error(`Invalid chain id: ${String(raw)}`);
  }
  console.log({ raw, parts, maybeId, id });
  return id;
}

export const getTransportForChain = (chainId: number) => {
  switch (chainId) {
    // mainnet
    case 1:
      return http(
        FORK_NODE_URL ||
          `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // optimism
    case 10:
      return http(
        FORK_NODE_URL ||
          `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // optimism sepolia
    case 11155420:
      return http(
        FORK_NODE_URL ||
          `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // base
    case 8453:
      return http(
        FORK_NODE_URL ||
          `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // arbitrum one
    case 42161:
      return http(
        FORK_NODE_URL ||
          `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // arbitrum sepolia
    case 421614:
      return http(
        FORK_NODE_URL ||
          `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // sepolia
    case 11155111:
      return http(
        FORK_NODE_URL ||
          `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
    // cyber
    case 7560:
      return fallback([
        http(FORK_NODE_URL || "https://rpc.cyber.co"),
        http(FORK_NODE_URL || "https://cyber.alt.technology"),
      ]);

    // scroll
    case 534_352:
      return fallback([
        http(
          FORK_NODE_URL ||
            `https://scroll-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
        ),
        http(FORK_NODE_URL || "https://rpc.scroll.io"),
      ]);

    // derive mainnet
    case 957:
      return http(FORK_NODE_URL || DERIVE_MAINNET_RPC);

    // derive testnet
    case 901:
      return http(FORK_NODE_URL || DERIVE_TESTNET_RPC);

    // linea
    case 59144:
      return http(
        FORK_NODE_URL ||
          `https://linea-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );

    // linea sepolia
    case 59141:
      return http(
        FORK_NODE_URL ||
          `https://linea-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );

    // bsc (binance smart chain)
    case 56:
      return http(
        FORK_NODE_URL ||
          `https://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );

    // for each new dao with a new chainId add them here
    default:
      return null;
  }
};

export const mapArbitrumBlockToMainnetBlock = unstable_cache(
  async (blockNumber: bigint) => {
    const { contracts } = Tenant.current();
    try {
      const block = await (contracts.governor.provider as AlchemyProvider).send(
        "eth_getBlockByNumber",
        [`0x${blockNumber.toString(16)}`, false]
      );

      const l1BlockNumber = hexToBigInt(block.l1BlockNumber);

      return l1BlockNumber;
    } catch (error) {
      return blockNumber;
    }
  },
  ["mapArbitrumBlockToMainnetBlock"],
  {
    revalidate: 60 * 60 * 24 * 365, // 1 year cache
  }
);

const isContractWallet = async (address: Address) => {
  const publicClient = getPublicClient();
  const bytecode = await publicClient.getCode({ address });

  return bytecode && bytecode !== "0x" ? true : false;
};

export function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

type TxServiceApiTransactionResponse = {
  safe: Address;
  to: Address;
  data: `0x${string}`;
  blockNumber: number;
  transactionHash: `0x${string}`;
  safeTxHash: `0x${string}`;
  executor: Address;
  isExecuted: boolean;
  isSuccessful: boolean;
  confirmations: Array<{
    owner: Address;
  }>;
};

const apiNetworkName: Record<number, string> = {
  [mainnet.id]: "mainnet",
  [optimism.id]: "optimism",
  [polygon.id]: "polygon",
  [base.id]: "base",
  [arbitrum.id]: "arbitrum",
  [goerli.id]: "goerli",
  [sepolia.id]: "sepolia",
  [scroll.id]: "scroll",
};

export const resolveSafeTx = async (
  networkId: number,
  safeTxHash: `0x${string}`,
  attempt = 1,
  maxAttempts = 10
): Promise<`0x${string}` | undefined> => {
  const networkName = apiNetworkName[networkId];
  if (attempt >= maxAttempts) {
    throw new Error(
      `timeout: couldn't find safeTx [${safeTxHash}] on [${networkName}]`
    );
  }

  const endpoint = `https://safe-transaction-${networkName}.safe.global`;
  const url = `${endpoint}/api/v1/multisig-transactions/${safeTxHash}`;

  const response = await fetch(url);

  const responseJson = <TxServiceApiTransactionResponse>await response.json();

  console.debug(
    `[${attempt}] looking up [${safeTxHash}] on [${networkName}]`,
    response
  );
  if (response.status == 404) {
    console.warn(
      `didn't find safe tx [${safeTxHash}], assuming it's already the real one`
    );
    return safeTxHash;
  }

  if (responseJson.isSuccessful === null) {
    await delay(1000 * attempt ** 1.75);
    return resolveSafeTx(networkId, safeTxHash, attempt + 1, maxAttempts);
  }

  if (!responseJson.isSuccessful) {
    return undefined;
  }
  return responseJson.transactionHash;
};

export const wrappedWaitForTransactionReceipt = async (
  params: WaitForTransactionReceiptParameters & {
    address: Address;
  }
): Promise<WaitForTransactionReceiptReturnType> => {
  const publicClient = getPublicClient();
  if (!publicClient.chain) {
    throw new Error("no chain on public client");
  }

  const isSafe = await isContractWallet(params.address);

  if (isSafe) {
    //try to resolve the underlying transaction
    const resolvedTx = await resolveSafeTx(publicClient.chain.id, params.hash);
    if (!resolvedTx) throw new Error("couldn't resolve safe tx");

    return publicClient.waitForTransactionReceipt({ hash: resolvedTx });
  } else {
    return publicClient.waitForTransactionReceipt(params);
  }
};

interface FunctionSignature {
  functionName: string;
  toStringValue: () => string | null;
  paramValues?: [string, string][] | null;
}

export function getFunctionSignature(
  decodedData: any
): FunctionSignature | null {
  if (
    !decodedData ||
    !decodedData.function ||
    decodedData.function === "unknown"
  ) {
    return null;
  }

  try {
    const paramTypes: {
      paramValues: [string | null, string | null];
    }[] = Object.entries(decodedData.parameters).map(
      ([paramName, paramValue]: [string, any]) => {
        //   Case where there is a name, but is no value, use name only
        if (paramName && paramValue.value === undefined) {
          return { paramValues: [paramName, null] };
          //   Case where there is no name, but is a value, use value only
        } else if (!paramName && paramValue.value) {
          return { paramValues: [null, paramValue.value] };
          //   Case where neither name nor value, fall back to type as value
        } else if (!paramName && paramValue.value === undefined) {
          return { paramValues: [null, paramValue.type] };
        }
        return {
          paramValues: [paramName, paramValue.value],
        };
      }
    );

    const functionName = decodedData.function.toString();

    const toStringValue = () => {
      if (!paramTypes) {
        return null;
      }

      // Filter out null values
      const filteredParams: [string, string][] = paramTypes
        .map((p) => p.paramValues)
        .filter((p): p is [string, string] => p !== null);

      // Build the function signature
      let signature = `${functionName}(`;
      signature += filteredParams
        .map((p) => {
          let formattedValue;
          const isArray = p[1] ? Array.isArray(p[1]) : false;
          const parsedParam = isArray
            ? (p[1] as unknown as any[])
                .map((item) => JSON.stringify(item.value || {}))
                .join(", ")
            : p[1];
          if (p[0] && parsedParam) {
            formattedValue = `${p[0]}=${parsedParam}`;
          } // Default, has both Name and Value
          else if (p[0] && !parsedParam) {
            formattedValue = `${p[0]}`;
          } // Has only Name
          else if (!p[0] && parsedParam) {
            formattedValue = `${parsedParam}`;
          } // Has only Value
          else if (!p[0] && !parsedParam) {
            formattedValue = `${parsedParam}`;
          } // Has neither Name nor Value, fallback to Type
          return formattedValue;
        })
        .join(",");
      signature += ")";
      return signature;
    };

    // Filter out null values from the param values
    const paramValues = paramTypes
      .map((p) => p.paramValues)
      .filter((p): p is [string, string] => p !== null);

    return {
      functionName: functionName,
      toStringValue: toStringValue,
      paramValues: paramValues,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getCanonicalType(input: any): string {
  if (input.type.startsWith("tuple")) {
    const arraySuffix = input.type.slice("tuple".length);
    const innerTypes = input.components
      ? input.components.map(getCanonicalType).join(",")
      : "";
    return `(${innerTypes})${arraySuffix}`;
  }
  return input.type;
}
