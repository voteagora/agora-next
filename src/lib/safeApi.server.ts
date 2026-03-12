import "server-only";

import { getAddress } from "viem";

import {
  normalizeSafeMessageStatusApiResponse,
  normalizeSafeMultisigTransactionApiResponse,
  type SafeMessageStatusApiResponse,
  type SafeMessageStatusResult,
  type SafeMultisigTransactionLookupResult,
  type SafeMultisigTransactionStatusApiResponse,
} from "@/lib/safeTransactionService";
import { getSafeTxServiceBaseUrls } from "@/lib/safeChains";

const SAFE_DEFAULT_POLL_MS = 5_000;
const SAFE_ACTIVE_CONFIRMATION_POLL_MS = 3_000;
const SAFE_RATE_LIMIT_BACKOFF_MS = 15_000;
const SAFE_CACHE_TTL_MS = 2_000;
const SAFE_TERMINAL_CACHE_TTL_MS = 30_000;
const SAFE_DISCOVERY_LOOKBACK_BUFFER_MS = 60_000;
const SAFE_MISSING_MULTISIG_GRACE_MS = 30_000;
const SAFE_DEBUG_LOGS = process.env.SAFE_DEBUG_LOGS === "true";

type SafeCacheEntry<T> = {
  value?: T;
  expiresAt: number;
  nextAllowedAt?: number;
  pending?: Promise<T>;
};

type SafeLookupAttempt = {
  url: string;
  status: number;
};

export type SafeRecentMessageLookup = {
  messageHash?: string;
  created?: string;
  modified?: string;
};

export type SafeRecentMultisigTransactionLookup = {
  safeTxHash?: string;
  transactionHash?: string | null;
  nonce?: number;
  created?: string;
  modified?: string;
  isExecuted?: boolean | null;
  isSuccessful?: boolean | null;
};

export type SafeDebugListResult<T> = {
  status: number;
  attempts: SafeLookupAttempt[];
  items: T[];
};

export type SafeDebugSnapshotResult = {
  chainId: number;
  safeAddress: `0x${string}`;
  trackedMessageHash?: `0x${string}`;
  matchingRecentMessage: SafeRecentMessageLookup | null;
  recentMessages: SafeDebugListResult<SafeRecentMessageLookup>;
  recentMultisigTransactions: SafeDebugListResult<SafeRecentMultisigTransactionLookup>;
};

type SafeMultisigTransactionListItemApiResponse = {
  safe?: string;
  to?: string;
  data?: string;
  submissionDate?: string;
  created?: string;
  modified?: string;
  safeTxHash?: string;
  isExecuted?: boolean | null;
};

const safeMessageStatusCache = new Map<
  string,
  SafeCacheEntry<SafeMessageStatusResult>
>();
const safeMultisigTransactionCache = new Map<
  string,
  SafeCacheEntry<SafeMultisigTransactionLookupResult>
>();

function getSafeApiHeaders() {
  const headers = new Headers({
    Accept: "application/json",
  });
  const apiKey = process.env.SAFE_API_KEY;

  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  return headers;
}

function getNormalizedCreatedAtMs(createdAt?: number | string) {
  if (typeof createdAt === "number" && Number.isFinite(createdAt)) {
    return createdAt;
  }

  if (typeof createdAt === "string" && createdAt.length > 0) {
    const parsed = Date.parse(createdAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeAddress(address?: string) {
  return address?.toLowerCase();
}

function formatSafeApiAddress(address: `0x${string}`) {
  try {
    return getAddress(address);
  } catch {
    return address;
  }
}

function parseRetryAfterMs(
  headers: Headers,
  fallbackMs = SAFE_RATE_LIMIT_BACKOFF_MS
) {
  const retryAfter = headers.get("retry-after");
  if (!retryAfter) {
    return fallbackMs;
  }

  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.max(Math.round(retryAfterSeconds * 1_000), 1_000);
  }

  const retryAfterDate = Date.parse(retryAfter);
  if (Number.isNaN(retryAfterDate)) {
    return fallbackMs;
  }

  return Math.max(retryAfterDate - Date.now(), 1_000);
}

function cacheResolvedValue<T>(
  cache: Map<string, SafeCacheEntry<T>>,
  key: string,
  value: T,
  {
    ttlMs,
    nextAllowedAt,
  }: {
    ttlMs: number;
    nextAllowedAt?: number;
  }
) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    nextAllowedAt,
  });
}

async function getCachedSafeValue<T>(
  cache: Map<string, SafeCacheEntry<T>>,
  key: string,
  load: (previousValue?: T) => Promise<{
    value: T;
    ttlMs: number;
    nextAllowedAt?: number;
  }>
) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached?.value && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.pending) {
    return cached.pending;
  }

  if (cached?.nextAllowedAt && cached.nextAllowedAt > now) {
    return cached.value as T;
  }

  const pending = load(cached?.value)
    .then((result) => {
      cacheResolvedValue(cache, key, result.value, {
        ttlMs: result.ttlMs,
        nextAllowedAt: result.nextAllowedAt,
      });
      return result.value;
    })
    .catch((error) => {
      if (cached?.value) {
        cache.set(key, {
          value: cached.value,
          expiresAt: cached.expiresAt,
          nextAllowedAt: cached.nextAllowedAt,
        });
      } else {
        cache.delete(key);
      }

      throw error;
    });

  cache.set(key, {
    value: cached?.value,
    expiresAt: cached?.expiresAt ?? 0,
    nextAllowedAt: cached?.nextAllowedAt,
    pending,
  });

  return pending;
}

async function fetchSafeTxServiceWithLegacyFallback(
  chainId: number,
  path: string
) {
  const baseUrls = getSafeTxServiceBaseUrls(chainId);
  if (baseUrls.length === 0) {
    throw new Error(`Unsupported Safe transaction service chain: ${chainId}`);
  }

  let lastResponse: Response | null = null;
  const attempts: SafeLookupAttempt[] = [];
  let bestRateLimitedResponse: Response | null = null;
  let firstErrorResponse: Response | null = null;

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      headers: getSafeApiHeaders(),
      cache: "no-store",
    });
    attempts.push({
      url,
      status: response.status,
    });

    if (response.ok) {
      return {
        response,
        attempts,
      };
    }

    if (response.status === 404) {
      lastResponse = response;
      continue;
    }

    if (response.status === 429) {
      bestRateLimitedResponse ??= response;
      continue;
    }

    firstErrorResponse ??= response;
  }

  return {
    response:
      bestRateLimitedResponse ??
      firstErrorResponse ??
      lastResponse ??
      new Response(null, { status: 404 }),
    attempts,
  };
}

function logSafeLookup(event: Record<string, unknown>) {
  if (!SAFE_DEBUG_LOGS) {
    return;
  }

  console.info("[safe-debug]", event);
}

export async function getRecentSafeMessagesForClient(
  chainId: number,
  safeAddress: `0x${string}`
): Promise<SafeDebugListResult<SafeRecentMessageLookup>> {
  const normalizedSafeAddress = formatSafeApiAddress(safeAddress);
  const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
    chainId,
    `/safes/${normalizedSafeAddress}/messages/?limit=5&ordering=-modified`
  );

  if (!response.ok) {
    return {
      status: response.status,
      attempts,
      items: [],
    };
  }

  const payload = (await response.json()) as
    | {
        results?: Array<{
          messageHash?: string;
          created?: string;
          modified?: string;
        }>;
      }
    | Array<{
        messageHash?: string;
        created?: string;
        modified?: string;
      }>;

  const results = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  return {
    status: response.status,
    attempts,
    items: results.slice(0, 5).map((message) => ({
      messageHash: message.messageHash,
      created: message.created,
      modified: message.modified,
    })),
  };
}

export async function getRecentSafeMultisigTransactionsForClient(
  chainId: number,
  safeAddress: `0x${string}`,
  options?: {
    limit?: number;
  }
): Promise<SafeDebugListResult<SafeRecentMultisigTransactionLookup>> {
  const normalizedSafeAddress = formatSafeApiAddress(safeAddress);
  const limit = options?.limit ?? 5;
  const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
    chainId,
    `/safes/${normalizedSafeAddress}/multisig-transactions/?limit=${limit}&ordering=-modified`
  );

  if (!response.ok) {
    return {
      status: response.status,
      attempts,
      items: [],
    };
  }

  const payload = (await response.json()) as
    | {
        results?: Array<{
          safeTxHash?: string;
          transactionHash?: string | null;
          nonce?: number;
          created?: string;
          modified?: string;
          isExecuted?: boolean | null;
          isSuccessful?: boolean | null;
        }>;
      }
    | Array<{
        safeTxHash?: string;
        transactionHash?: string | null;
        nonce?: number;
        created?: string;
        modified?: string;
        isExecuted?: boolean | null;
        isSuccessful?: boolean | null;
      }>;

  const results = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  return {
    status: response.status,
    attempts,
    items: results.slice(0, limit).map((transaction) => ({
      safeTxHash: transaction.safeTxHash,
      transactionHash: transaction.transactionHash,
      nonce: transaction.nonce,
      created: transaction.created,
      modified: transaction.modified,
      isExecuted: transaction.isExecuted,
      isSuccessful: transaction.isSuccessful,
    })),
  };
}

async function hasSafeMultisigTransactionInRecentListForClient(params: {
  chainId: number;
  safeAddress: `0x${string}`;
  safeTxHash: `0x${string}`;
}): Promise<boolean | null> {
  const recentTransactions = await getRecentSafeMultisigTransactionsForClient(
    params.chainId,
    params.safeAddress,
    {
      limit: 100,
    }
  );

  if (recentTransactions.status !== 200) {
    return null;
  }

  return recentTransactions.items.some(
    (transaction) =>
      transaction.safeTxHash?.toLowerCase() === params.safeTxHash.toLowerCase()
  );
}

async function getSafeMultisigTransactionsForDiscovery(params: {
  chainId: number;
  safeAddress: `0x${string}`;
  limit?: number;
}): Promise<SafeDebugListResult<SafeMultisigTransactionListItemApiResponse>> {
  const normalizedSafeAddress = formatSafeApiAddress(params.safeAddress);
  const limit = params.limit ?? 20;
  const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
    params.chainId,
    `/safes/${normalizedSafeAddress}/multisig-transactions/?limit=${limit}&ordering=-modified`
  );

  if (!response.ok) {
    return {
      status: response.status,
      attempts,
      items: [],
    };
  }

  const payload = (await response.json()) as
    | {
        results?: SafeMultisigTransactionListItemApiResponse[];
      }
    | SafeMultisigTransactionListItemApiResponse[];

  const results = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  return {
    status: response.status,
    attempts,
    items: results.slice(0, limit),
  };
}

export async function getSafeDebugSnapshotForClient(
  chainId: number,
  safeAddress: `0x${string}`,
  trackedMessageHash?: `0x${string}`
): Promise<SafeDebugSnapshotResult> {
  const [recentMessages, recentMultisigTransactions] = await Promise.all([
    getRecentSafeMessagesForClient(chainId, safeAddress),
    getRecentSafeMultisigTransactionsForClient(chainId, safeAddress),
  ]);

  const normalizedTrackedMessageHash = trackedMessageHash?.toLowerCase();
  const matchingRecentMessage =
    recentMessages.items.find(
      (message) =>
        message.messageHash?.toLowerCase() === normalizedTrackedMessageHash
    ) ?? null;

  logSafeLookup({
    event: "safe_debug_snapshot",
    chainId,
    safeAddress,
    trackedMessageHash,
    matchingRecentMessageHash: matchingRecentMessage?.messageHash ?? null,
    recentMessageCount: recentMessages.items.length,
    recentMultisigTransactionCount: recentMultisigTransactions.items.length,
    recentMessageStatuses: recentMessages.attempts,
    recentMultisigTransactionStatuses: recentMultisigTransactions.attempts,
  });

  return {
    chainId,
    safeAddress,
    trackedMessageHash,
    matchingRecentMessage,
    recentMessages,
    recentMultisigTransactions,
  };
}

export async function findQueuedSafeMultisigTransactionForClient(params: {
  chainId: number;
  safeAddress: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
  createdAfter: number;
}): Promise<{
  safeTxHash: `0x${string}`;
  txId: string;
} | null> {
  const createdAfterCutoff =
    params.createdAfter - SAFE_DISCOVERY_LOOKBACK_BUFFER_MS;
  const transactionList = await getSafeMultisigTransactionsForDiscovery({
    chainId: params.chainId,
    safeAddress: params.safeAddress,
    limit: 20,
  });

  if (transactionList.status !== 200) {
    throw new Error(
      `Failed to load Safe tx-service multisig list (${transactionList.status})`
    );
  }

  const matchingTransaction = transactionList.items
    .filter((transaction) => {
      const transactionTimestamp = getNormalizedCreatedAtMs(
        transaction.submissionDate ??
          transaction.created ??
          transaction.modified
      );

      if (
        typeof transactionTimestamp !== "number" ||
        transactionTimestamp < createdAfterCutoff
      ) {
        return false;
      }

      if (
        transaction.safe &&
        normalizeAddress(transaction.safe) !==
          normalizeAddress(params.safeAddress)
      ) {
        return false;
      }

      if (normalizeAddress(transaction.to) !== normalizeAddress(params.to)) {
        return false;
      }

      if (transaction.data?.toLowerCase() !== params.data.toLowerCase()) {
        return false;
      }

      return transaction.safeTxHash?.startsWith("0x") === true;
    })
    .sort((left, right) => {
      const leftExecuted = left.isExecuted ? 1 : 0;
      const rightExecuted = right.isExecuted ? 1 : 0;
      if (leftExecuted !== rightExecuted) {
        return leftExecuted - rightExecuted;
      }

      const leftTimestamp =
        getNormalizedCreatedAtMs(
          left.submissionDate ?? left.created ?? left.modified
        ) ?? 0;
      const rightTimestamp =
        getNormalizedCreatedAtMs(
          right.submissionDate ?? right.created ?? right.modified
        ) ?? 0;

      return rightTimestamp - leftTimestamp;
    })[0];

  if (!matchingTransaction?.safeTxHash) {
    return null;
  }

  return {
    safeTxHash: matchingTransaction.safeTxHash as `0x${string}`,
    txId: matchingTransaction.safeTxHash,
  };
}

export async function getSafeMessageStatusForClient(
  chainId: number,
  messageHash: `0x${string}`,
  safeAddress?: `0x${string}`
): Promise<SafeMessageStatusResult> {
  const cacheKey = `${chainId}:${messageHash}`;

  return getCachedSafeValue(
    safeMessageStatusCache,
    cacheKey,
    async (previousValue) => {
      const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
        chainId,
        `/messages/${messageHash}`
      );

      if (response.status === 404) {
        const recentMessages =
          safeAddress && SAFE_DEBUG_LOGS
            ? await getRecentSafeMessagesForClient(chainId, safeAddress)
            : null;
        logSafeLookup({
          event: "safe_message_status_lookup",
          chainId,
          messageHash,
          safeAddress,
          outcome: "not_found",
          attempts,
          cachedConfirmationCount:
            previousValue?.status?.confirmations.length ?? 0,
          recentMessageStatus: recentMessages?.status ?? null,
          recentMessageAttempts: recentMessages?.attempts ?? [],
          recentMessages: recentMessages?.items ?? [],
        });
        return {
          value: {
            status: null,
            nextPollMs: SAFE_DEFAULT_POLL_MS,
          },
          ttlMs: SAFE_CACHE_TTL_MS,
        };
      }

      if (response.status === 429) {
        const nextPollMs = parseRetryAfterMs(response.headers);
        logSafeLookup({
          event: "safe_message_status_lookup",
          chainId,
          messageHash,
          outcome: "rate_limited",
          attempts,
          nextPollMs,
          cachedConfirmationCount:
            previousValue?.status?.confirmations.length ?? 0,
        });
        return {
          value: {
            status: previousValue?.status ?? null,
            nextPollMs,
            rateLimited: true,
          },
          ttlMs: nextPollMs,
          nextAllowedAt: Date.now() + nextPollMs,
        };
      }

      if (!response.ok) {
        logSafeLookup({
          event: "safe_message_status_lookup",
          chainId,
          messageHash,
          outcome: "error",
          attempts,
          status: response.status,
        });
        throw new Error(
          `Failed to load Safe message status (${response.status})`
        );
      }

      const payload =
        (await response.json()) as SafeMessageStatusApiResponse | null;
      const status = normalizeSafeMessageStatusApiResponse(
        payload,
        messageHash
      );
      const hasConfirmations = status.confirmations.length > 0;
      logSafeLookup({
        event: "safe_message_status_lookup",
        chainId,
        messageHash,
        outcome: "ok",
        attempts,
        confirmationCount: status.confirmations.length,
        signedOwners: status.signedOwners,
        safeAddress: status.safeAddress,
      });

      return {
        value: {
          status,
          nextPollMs: hasConfirmations
            ? SAFE_ACTIVE_CONFIRMATION_POLL_MS
            : SAFE_DEFAULT_POLL_MS,
        },
        ttlMs: SAFE_CACHE_TTL_MS,
      };
    }
  );
}

export async function getSafeMultisigTransactionForClient(
  chainId: number,
  safeTxHash: `0x${string}`,
  options?: {
    safeAddress?: `0x${string}`;
    createdAt?: number | string;
  }
): Promise<SafeMultisigTransactionLookupResult> {
  const cacheKey = [
    chainId,
    safeTxHash.toLowerCase(),
    normalizeAddress(options?.safeAddress) ?? "no-safe",
    String(getNormalizedCreatedAtMs(options?.createdAt) ?? "no-created-at"),
  ].join(":");

  return getCachedSafeValue(
    safeMultisigTransactionCache,
    cacheKey,
    async (previousValue) => {
      const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
        chainId,
        `/multisig-transactions/${safeTxHash}`
      );

      if (response.status === 404) {
        let recentListContainsTransaction: boolean | null = null;
        const createdAtMs = getNormalizedCreatedAtMs(options?.createdAt);
        const hasSeenTransactionBefore =
          previousValue?.found === true ||
          previousValue?.missingReason === "removed";
        const isPastGracePeriod =
          typeof createdAtMs === "number" &&
          Date.now() - createdAtMs >= SAFE_MISSING_MULTISIG_GRACE_MS;

        if (
          options?.safeAddress &&
          (hasSeenTransactionBefore || isPastGracePeriod)
        ) {
          try {
            recentListContainsTransaction =
              await hasSafeMultisigTransactionInRecentListForClient({
                chainId,
                safeAddress: options.safeAddress,
                safeTxHash,
              });
          } catch (error) {
            logSafeLookup({
              event: "safe_multisig_transaction_lookup",
              chainId,
              safeTxHash,
              safeAddress: options.safeAddress,
              outcome: "recent_list_lookup_error",
              attempts,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown recent transaction lookup error",
            });
          }
        }

        const missingReason =
          recentListContainsTransaction === false &&
          (hasSeenTransactionBefore || isPastGracePeriod)
            ? "removed"
            : "indexing";
        const ttlMs =
          missingReason === "removed"
            ? SAFE_TERMINAL_CACHE_TTL_MS
            : SAFE_CACHE_TTL_MS;

        logSafeLookup({
          event: "safe_multisig_transaction_lookup",
          chainId,
          safeTxHash,
          outcome: "not_found",
          attempts,
          safeAddress: options?.safeAddress,
          recentListContainsTransaction,
          missingReason,
          hasSeenTransactionBefore,
          createdAtMs,
        });
        return {
          value: {
            found: false,
            status: null,
            isSuccessful: null,
            nextPollMs:
              missingReason === "removed"
                ? SAFE_TERMINAL_CACHE_TTL_MS
                : SAFE_DEFAULT_POLL_MS,
            missingReason,
          },
          ttlMs,
        };
      }

      if (response.status === 429) {
        const nextPollMs = parseRetryAfterMs(response.headers);
        logSafeLookup({
          event: "safe_multisig_transaction_lookup",
          chainId,
          safeTxHash,
          outcome: "rate_limited",
          attempts,
          nextPollMs,
        });
        return {
          value: {
            found: previousValue?.found ?? true,
            status: previousValue?.status ?? null,
            isSuccessful: previousValue?.isSuccessful ?? null,
            transactionHash: previousValue?.transactionHash,
            nextPollMs,
            rateLimited: true,
            missingReason: previousValue?.missingReason,
          },
          ttlMs: nextPollMs,
          nextAllowedAt: Date.now() + nextPollMs,
        };
      }

      if (!response.ok) {
        logSafeLookup({
          event: "safe_multisig_transaction_lookup",
          chainId,
          safeTxHash,
          outcome: "error",
          attempts,
          status: response.status,
        });
        throw new Error(
          `Failed to load Safe multisig transaction (${response.status})`
        );
      }

      const payload =
        (await response.json()) as SafeMultisigTransactionStatusApiResponse;
      const status = normalizeSafeMultisigTransactionApiResponse(
        payload,
        safeTxHash
      );
      const hasConfirmations = status.confirmations.length > 0;
      const isTerminal = status.isSuccessful !== null;
      logSafeLookup({
        event: "safe_multisig_transaction_lookup",
        chainId,
        safeTxHash,
        outcome: "ok",
        attempts,
        isSuccessful: status.isSuccessful,
        transactionHash: status.transactionHash,
        confirmationCount: status.confirmations.length,
        signedOwners: status.signedOwners,
        safeAddress: status.safeAddress,
      });

      return {
        value: {
          found: true,
          status,
          isSuccessful: status.isSuccessful,
          transactionHash: status.transactionHash,
          nextPollMs: hasConfirmations
            ? SAFE_ACTIVE_CONFIRMATION_POLL_MS
            : SAFE_DEFAULT_POLL_MS,
          missingReason: undefined,
        },
        ttlMs: isTerminal ? SAFE_TERMINAL_CACHE_TTL_MS : SAFE_CACHE_TTL_MS,
      };
    }
  );
}
