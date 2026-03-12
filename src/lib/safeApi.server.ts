import "server-only";

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
const SAFE_CLIENT_API_BASE_URL = "https://safe-client.safe.global/v1";
const SAFE_DISCOVERY_LOOKBACK_BUFFER_MS = 60_000;
const SAFE_MISSING_MULTISIG_GRACE_MS = 30_000;
const SAFE_QUEUE_SCAN_MAX_PAGES = 5;
const SAFE_QUEUE_SCAN_MAX_TRANSACTIONS = 100;
const SAFE_DEBUG_LOGS =
  process.env.SAFE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

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

type SafeQueuedTransactionListApiResponse = {
  next?: string | null;
  results?: Array<{
    type?: string;
    transaction?: {
      id?: string;
      timestamp?: number;
      txStatus?: string;
      txInfo?: {
        to?: {
          value?: string;
        };
      };
    };
  }>;
};

type SafeClientTransactionDetailsApiResponse = {
  safeAddress?: string;
  txId?: string;
  txData?: {
    hexData?: string;
    to?: {
      value?: string;
    };
  };
  detailedExecutionInfo?: {
    type?: string;
    safeTxHash?: string;
  };
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

async function fetchSafeClientApi<T>(path: string): Promise<T> {
  const response = await fetch(
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${SAFE_CLIENT_API_BASE_URL}${path}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load Safe client API (${response.status})`);
  }

  return (await response.json()) as T;
}

function normalizeTimestamp(timestamp?: number) {
  if (!timestamp || !Number.isFinite(timestamp)) {
    return null;
  }

  return timestamp < 1_000_000_000_000 ? timestamp * 1_000 : timestamp;
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

function getQueuedTransactionIds(queue: SafeQueuedTransactionListApiResponse) {
  return (queue.results ?? [])
    .filter((item) => item.type === "TRANSACTION")
    .map((item) => item.transaction)
    .filter(
      (transaction): transaction is NonNullable<typeof transaction> =>
        Boolean(transaction?.id)
    );
}

async function findQueuedSafeMultisigTransactionByHashForClient(params: {
  chainId: number;
  safeAddress: `0x${string}`;
  safeTxHash: `0x${string}`;
}): Promise<
  | {
      safeTxHash: `0x${string}`;
      txId: string;
    }
  | null
> {
  let pageUrl =
    `/chains/${params.chainId}/safes/${params.safeAddress}` +
    "/transactions/queued?trusted=true";
  let scannedTransactions = 0;

  for (let page = 0; page < SAFE_QUEUE_SCAN_MAX_PAGES && pageUrl; page += 1) {
    const queue =
      await fetchSafeClientApi<SafeQueuedTransactionListApiResponse>(pageUrl);
    const transactions = getQueuedTransactionIds(queue);
    scannedTransactions += transactions.length;

    const details = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const result =
            await fetchSafeClientApi<SafeClientTransactionDetailsApiResponse>(
              `/chains/${params.chainId}/transactions/${encodeURIComponent(
                transaction.id!
              )}`
            );
          return {
            txId: transaction.id!,
            result,
          };
        } catch {
          return null;
        }
      })
    );

    for (const detail of details) {
      if (!detail) {
        continue;
      }

      const executionInfo = detail.result.detailedExecutionInfo;
      if (normalizeAddress(detail.result.safeAddress) !== normalizeAddress(params.safeAddress)) {
        continue;
      }

      if (
        executionInfo?.type !== "MULTISIG" ||
        executionInfo.safeTxHash?.toLowerCase() !== params.safeTxHash.toLowerCase()
      ) {
        continue;
      }

      return {
        safeTxHash: executionInfo.safeTxHash as `0x${string}`,
        txId: detail.result.txId ?? detail.txId,
      };
    }

    if (scannedTransactions >= SAFE_QUEUE_SCAN_MAX_TRANSACTIONS) {
      break;
    }

    pageUrl = queue.next ?? "";
  }

  return null;
}

function parseRetryAfterMs(headers: Headers, fallbackMs = SAFE_RATE_LIMIT_BACKOFF_MS) {
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
  const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
    chainId,
    `/safes/${safeAddress}/messages/?limit=5&ordering=-modified`
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
  safeAddress: `0x${string}`
): Promise<SafeDebugListResult<SafeRecentMultisigTransactionLookup>> {
  const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
    chainId,
    `/safes/${safeAddress}/multisig-transactions/?limit=5&ordering=-modified`
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
    items: results.slice(0, 5).map((transaction) => ({
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
      (message) => message.messageHash?.toLowerCase() === normalizedTrackedMessageHash
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
}): Promise<
  | {
      safeTxHash: `0x${string}`;
      txId: string;
    }
  | null
> {
  const queue = await fetchSafeClientApi<SafeQueuedTransactionListApiResponse>(
    `/chains/${params.chainId}/safes/${params.safeAddress}/transactions/queued?trusted=true`
  );
  const createdAfterCutoff =
    params.createdAfter - SAFE_DISCOVERY_LOOKBACK_BUFFER_MS;

  const candidateIds = (queue.results ?? [])
    .filter((item) => item.type === "TRANSACTION")
    .map((item) => item.transaction)
    .filter(
      (transaction): transaction is NonNullable<typeof transaction> =>
        Boolean(transaction?.id)
    )
    .filter((transaction) => {
      const timestamp = normalizeTimestamp(transaction.timestamp);
      if (timestamp === null || timestamp < createdAfterCutoff) {
        return false;
      }

      const txTo = normalizeAddress(transaction.txInfo?.to?.value);
      return txTo === normalizeAddress(params.to);
    })
    .sort((left, right) => (right.timestamp ?? 0) - (left.timestamp ?? 0))
    .slice(0, 5)
    .map((transaction) => transaction.id!);

  if (candidateIds.length === 0) {
    return null;
  }

  const details = await Promise.all(
    candidateIds.map(async (txId) => {
      try {
        const result =
          await fetchSafeClientApi<SafeClientTransactionDetailsApiResponse>(
            `/chains/${params.chainId}/transactions/${encodeURIComponent(txId)}`
          );
        return {
          txId,
          result,
        };
      } catch {
        return null;
      }
    })
  );

  for (const detail of details) {
    if (!detail) {
      continue;
    }

    const txData = detail.result.txData;
    const executionInfo = detail.result.detailedExecutionInfo;
    if (normalizeAddress(detail.result.safeAddress) !== normalizeAddress(params.safeAddress)) {
      continue;
    }

    if (normalizeAddress(txData?.to?.value) !== normalizeAddress(params.to)) {
      continue;
    }

    if (txData?.hexData?.toLowerCase() !== params.data.toLowerCase()) {
      continue;
    }

    if (
      executionInfo?.type !== "MULTISIG" ||
      !executionInfo.safeTxHash?.startsWith("0x")
    ) {
      continue;
    }

    return {
      safeTxHash: executionInfo.safeTxHash as `0x${string}`,
      txId: detail.result.txId ?? detail.txId,
    };
  }

  return null;
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
          cachedConfirmationCount: previousValue?.status?.confirmations.length ?? 0,
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
          cachedConfirmationCount: previousValue?.status?.confirmations.length ?? 0,
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
        throw new Error(`Failed to load Safe message status (${response.status})`);
      }

      const payload =
        (await response.json()) as SafeMessageStatusApiResponse | null;
      const status = normalizeSafeMessageStatusApiResponse(payload, messageHash);
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
  const cacheKey = `${chainId}:${safeTxHash}`;

  return getCachedSafeValue(
    safeMultisigTransactionCache,
    cacheKey,
    async (previousValue) => {
      const { response, attempts } = await fetchSafeTxServiceWithLegacyFallback(
        chainId,
        `/multisig-transactions/${safeTxHash}`
      );

      if (response.status === 404) {
        let queueContainsTransaction: boolean | null = null;

        if (options?.safeAddress) {
          try {
            queueContainsTransaction = Boolean(
              await findQueuedSafeMultisigTransactionByHashForClient({
                chainId,
                safeAddress: options.safeAddress,
                safeTxHash,
              })
            );
          } catch (error) {
            logSafeLookup({
              event: "safe_multisig_transaction_lookup",
              chainId,
              safeTxHash,
              safeAddress: options.safeAddress,
              outcome: "queue_lookup_error",
              attempts,
              error:
                error instanceof Error ? error.message : "Unknown queue lookup error",
            });
          }
        }

        const createdAtMs = getNormalizedCreatedAtMs(options?.createdAt);
        const hasSeenTransactionBefore =
          previousValue?.found === true || previousValue?.missingReason === "removed";
        const isPastGracePeriod =
          typeof createdAtMs === "number" &&
          Date.now() - createdAtMs >= SAFE_MISSING_MULTISIG_GRACE_MS;
        const missingReason =
          queueContainsTransaction === false &&
          (hasSeenTransactionBefore || isPastGracePeriod)
            ? "removed"
            : "indexing";
        const ttlMs =
          missingReason === "removed" ? SAFE_TERMINAL_CACHE_TTL_MS : SAFE_CACHE_TTL_MS;

        logSafeLookup({
          event: "safe_multisig_transaction_lookup",
          chainId,
          safeTxHash,
          outcome: "not_found",
          attempts,
          safeAddress: options?.safeAddress,
          queueContainsTransaction,
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
