import {
  BaseError,
  ChainMismatchError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  WaitForTransactionReceiptTimeoutError,
  decodeErrorResult,
} from "viem";
import { isUserCancellationDetails } from "@/lib/mirador/eventSeverity";

export type VoteErrorCode =
  | "INVALID_ATTESTER"
  | "ALREADY_VOTED"
  | "VOTING_NOT_STARTED"
  | "VOTING_ENDED"
  | "PROPOSAL_NOT_FOUND"
  | "INVALID_SCHEMA"
  | "INVALID_ATTESTATION"
  | "INVALID_EXPIRATION_TIME"
  | "IRREVOCABLE"
  | "ACCESS_DENIED"
  | "WRONG_SCHEMA"
  | "PROPOSAL_DATA_MISMATCH"
  | "CONTRACT_ERROR"
  | "INVALID_PROPOSAL"
  | "UNSUPPORTED_CHAIN"
  | "WRONG_CHAIN"
  | "WALLET_NOT_READY"
  | "USER_REJECTED"
  | "SIMULATION_FAILED"
  | "REVERTED"
  | "CONFIRMATION_TIMEOUT"
  | "UNKNOWN";

export type ClassifiedVoteError = {
  code: VoteErrorCode;
  message: string;
};

type SelectorEntry = ClassifiedVoteError & { errorName: string };

type VoteErrorAbiItem = {
  readonly type: "error";
  readonly name: string;
  readonly inputs: readonly [];
};

/**
 * 4-byte selectors of the custom errors the EAS vote path can hit.
 * The first four come from the oodao `VotesResolver`; the rest from EAS itself.
 */
export const VOTE_ERROR_SELECTORS: Record<string, SelectorEntry> = {
  "0xb8daf542": {
    errorName: "InvalidAttester",
    code: "INVALID_ATTESTER",
    message:
      "Invalid attester - you are not authorized to vote on this proposal",
  },
  "0x7c9a1cf9": {
    errorName: "AlreadyVoted",
    code: "ALREADY_VOTED",
    message: "You have already voted on this proposal",
  },
  "0x7fa01202": {
    errorName: "VotingNotStarted",
    code: "VOTING_NOT_STARTED",
    message: "Voting has not started yet",
  },
  "0x7a19ed05": {
    errorName: "VotingEnded",
    code: "VOTING_ENDED",
    message: "Voting has ended for this proposal",
  },
  "0xc5723b51": {
    errorName: "NotFound",
    code: "PROPOSAL_NOT_FOUND",
    message:
      "Proposal not found on this network - make sure your wallet is on the correct network",
  },
  "0xbf37b20e": {
    errorName: "InvalidSchema",
    code: "INVALID_SCHEMA",
    message: "Vote schema not found on this network",
  },
  "0xbd8ba84d": {
    errorName: "InvalidAttestation",
    code: "INVALID_ATTESTATION",
    message: "The vote attestation was rejected by the resolver",
  },
  "0x08e8b937": {
    errorName: "InvalidExpirationTime",
    code: "INVALID_EXPIRATION_TIME",
    message: "The vote attestation has an invalid expiration time",
  },
  "0x157bd4c3": {
    errorName: "Irrevocable",
    code: "IRREVOCABLE",
    message: "This attestation schema is irrevocable",
  },
  "0x4ca88867": {
    errorName: "AccessDenied",
    code: "ACCESS_DENIED",
    message: "Access denied by the vote resolver",
  },
  "0x21b8eeb9": {
    errorName: "WrongSchema",
    code: "WRONG_SCHEMA",
    message: "The vote attestation references the wrong schema",
  },
};

const PANIC_SELECTOR = "0x4e487b71";
const ERROR_STRING_SELECTOR = "0x08c379a0";
const ASSERT_PANIC_CODE = 1n;

const PROPOSAL_DATA_MISMATCH_MESSAGE =
  "Proposal data mismatch - the proposal attestation does not belong to this DAO";

/**
 * ABI fragments for the custom errors above so viem can decode simulation
 * reverts by name. `Panic(uint256)` and `Error(string)` are decoded by viem
 * without being listed here.
 */
export const VOTE_RESOLVER_ERRORS_ABI: readonly VoteErrorAbiItem[] =
  Object.values(VOTE_ERROR_SELECTORS).map((entry) => ({
    type: "error",
    name: entry.errorName,
    inputs: [],
  }));

const ENTRY_BY_NAME: Record<string, SelectorEntry> = Object.fromEntries(
  Object.values(VOTE_ERROR_SELECTORS).map((entry) => [entry.errorName, entry])
);

const CONTRACT_REVERT_CODES = new Set<VoteErrorCode>([
  ...Object.values(VOTE_ERROR_SELECTORS).map((entry) => entry.code),
  "PROPOSAL_DATA_MISMATCH",
  "CONTRACT_ERROR",
]);

export function isContractRevertCode(code: VoteErrorCode): boolean {
  return CONTRACT_REVERT_CODES.has(code);
}

/**
 * Error thrown by the vote submission pipeline. The tx context fields are own
 * enumerable properties so `extractFailedEasTxContext` can read them.
 */
export class VoteSubmissionError extends Error {
  code: VoteErrorCode;
  txInputData?: string;
  chainId?: number;
  txHash?: string;

  constructor(
    code: VoteErrorCode,
    message: string,
    context: {
      txInputData?: string;
      chainId?: number;
      txHash?: string;
      cause?: unknown;
    } = {}
  ) {
    super(message, context.cause ? { cause: context.cause } : undefined);
    this.name = "VoteSubmissionError";
    this.code = code;
    this.txInputData = context.txInputData;
    this.chainId = context.chainId;
    this.txHash = context.txHash;
  }
}

function classifyByErrorName(
  errorName: string,
  args: readonly unknown[] | undefined
): ClassifiedVoteError | undefined {
  const known = ENTRY_BY_NAME[errorName];
  if (known) {
    return { code: known.code, message: known.message };
  }

  if (errorName === "Panic") {
    return classifyPanic(args?.[0]);
  }

  if (errorName === "Error") {
    const reason = typeof args?.[0] === "string" ? args[0] : "";
    return {
      code: "CONTRACT_ERROR",
      message: reason
        ? `Transaction reverted: ${reason}`
        : "Transaction reverted",
    };
  }

  return undefined;
}

function classifyPanic(panicCode: unknown): ClassifiedVoteError {
  const code =
    typeof panicCode === "bigint"
      ? panicCode
      : typeof panicCode === "number"
        ? BigInt(panicCode)
        : undefined;

  if (code === ASSERT_PANIC_CODE) {
    return {
      code: "PROPOSAL_DATA_MISMATCH",
      message: PROPOSAL_DATA_MISMATCH_MESSAGE,
    };
  }

  return {
    code: "CONTRACT_ERROR",
    message:
      code === undefined
        ? "Transaction reverted with a contract panic"
        : `Transaction reverted with a contract panic (code ${code.toString()})`,
  };
}

function classifyBySelector(hex: string): ClassifiedVoteError | undefined {
  const normalized = hex.toLowerCase();
  const selector = normalized.slice(0, 10);

  const known = VOTE_ERROR_SELECTORS[selector];
  if (known) {
    return { code: known.code, message: known.message };
  }

  if (selector === PANIC_SELECTOR || selector === ERROR_STRING_SELECTOR) {
    try {
      const decoded = decodeErrorResult({
        abi: [],
        data: normalized as `0x${string}`,
      });
      return classifyByErrorName(decoded.errorName, decoded.args);
    } catch {
      return selector === PANIC_SELECTOR
        ? classifyPanic(undefined)
        : { code: "CONTRACT_ERROR", message: "Transaction reverted" };
    }
  }

  return undefined;
}

const MAX_SCAN_DEPTH = 6;
const STRING_FIELDS = [
  "message",
  "shortMessage",
  "details",
  "reason",
  "data",
  "raw",
  "signature",
] as const;

function collectErrorStrings(
  value: unknown,
  out: string[],
  depth = 0,
  seen = new Set<unknown>()
) {
  if (value == null || depth > MAX_SCAN_DEPTH) {
    return;
  }

  if (typeof value === "string") {
    out.push(value);
    return;
  }

  if (typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);

  const record = value as Record<string, unknown>;

  for (const field of STRING_FIELDS) {
    const fieldValue = record[field];
    if (typeof fieldValue === "string") {
      out.push(fieldValue);
    } else if (fieldValue && typeof fieldValue === "object") {
      collectErrorStrings(fieldValue, out, depth + 1, seen);
    }
  }

  for (const nested of ["cause", "error", "info", "metaMessages"]) {
    if (record[nested] !== undefined) {
      collectErrorStrings(record[nested], out, depth + 1, seen);
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectErrorStrings(item, out, depth + 1, seen);
    }
  }
}

const REVERT_DATA_PATTERN = /0x[0-9a-f]{8}(?:[0-9a-f]{64})*/gi;

function classifyFromStrings(
  strings: string[]
): ClassifiedVoteError | undefined {
  for (const text of strings) {
    const matches = text.match(REVERT_DATA_PATTERN);
    if (!matches) {
      continue;
    }

    for (const candidate of matches) {
      const classified = classifyBySelector(candidate);
      if (classified) {
        return classified;
      }
    }
  }

  return undefined;
}

function isConnectorChainMismatch(error: unknown): boolean {
  let current: unknown = error;
  let depth = 0;

  while (current && typeof current === "object" && depth < MAX_SCAN_DEPTH) {
    const name = (current as { name?: unknown }).name;
    if (
      name === "ConnectorChainMismatchError" ||
      name === "ChainMismatchError"
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
    depth += 1;
  }

  return false;
}

const USER_REJECTED: ClassifiedVoteError = {
  code: "USER_REJECTED",
  message: "Transaction was rejected in your wallet",
};

const WRONG_CHAIN: ClassifiedVoteError = {
  code: "WRONG_CHAIN",
  message: "Your wallet is on the wrong network - switch networks to vote",
};

const CONFIRMATION_TIMEOUT: ClassifiedVoteError = {
  code: "CONFIRMATION_TIMEOUT",
  message:
    "Your vote was submitted but has not been confirmed yet. Check back in a few minutes.",
};

/**
 * Turns anything thrown by the vote path (viem, wagmi, ethers, our own errors)
 * into a stable code plus a user-facing message.
 */
export function classifyVoteError(error: unknown): ClassifiedVoteError {
  if (error instanceof VoteSubmissionError) {
    return { code: error.code, message: error.message };
  }

  if (error instanceof BaseError) {
    const reverted = error.walk(
      (e) => e instanceof ContractFunctionRevertedError
    ) as ContractFunctionRevertedError | null;

    if (reverted) {
      if (reverted.data?.errorName) {
        const byName = classifyByErrorName(
          reverted.data.errorName,
          reverted.data.args as readonly unknown[] | undefined
        );
        if (byName) {
          return byName;
        }
      }

      const rawData = reverted.raw ?? reverted.signature;
      if (rawData) {
        const bySelector = classifyBySelector(rawData);
        if (bySelector) {
          return bySelector;
        }
      }
    }

    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return USER_REJECTED;
    }

    if (error.walk((e) => e instanceof ChainMismatchError)) {
      return WRONG_CHAIN;
    }

    if (error.walk((e) => e instanceof WaitForTransactionReceiptTimeoutError)) {
      return CONFIRMATION_TIMEOUT;
    }
  }

  if (isConnectorChainMismatch(error)) {
    return WRONG_CHAIN;
  }

  const strings: string[] = [];
  collectErrorStrings(error, strings);

  const fromRevertData = classifyFromStrings(strings);
  if (fromRevertData) {
    return fromRevertData;
  }

  if (isUserCancellationDetails(error)) {
    return USER_REJECTED;
  }

  const fallbackMessage =
    error instanceof Error && error.message
      ? error.message
      : typeof error === "string" && error.length > 0
        ? error
        : "Failed to submit vote";

  return { code: "UNKNOWN", message: fallbackMessage };
}

/**
 * Parses vote submission errors and returns user-friendly error messages
 * @param error - The error object or message from vote submission
 * @returns A user-friendly error message string
 */
export function parseVoteError(error: unknown): string {
  return classifyVoteError(error).message;
}
