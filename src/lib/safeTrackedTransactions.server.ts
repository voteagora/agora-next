import "server-only";

import { Prisma } from "@prisma/client";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import type { MiradorTraceContext } from "@/lib/mirador/types";
import {
  findQueuedSafeMultisigTransactionForClient,
  getSafeMultisigTransactionForClient,
} from "@/lib/safeApi.server";
import type {
  DiscoverSafeTrackedTransactionRequest,
  CreateSafeTrackedTransactionRequest,
  SafeTrackedTransactionSummary,
} from "@/lib/safeTrackedTransactions";

const SAFE_TRACKED_TRANSACTION_REFRESH_TTL_MS = 15_000;
const SAFE_TRACKED_TRANSACTION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1_000;

type SafeTrackedTransactionRow = {
  dao_slug: string;
  kind: SafeTrackedTransactionSummary["kind"];
  safe_address: string;
  chain_id: number;
  safe_tx_hash: string;
  created_at: Date;
};

type SafeTrackedTransactionRefreshCacheEntry = {
  checkedAt: number;
  row: SafeTrackedTransactionRow;
};

const safeTrackedTransactionRefreshCache = new Map<
  string,
  SafeTrackedTransactionRefreshCacheEntry
>();

export class SafeTrackedTransactionLookupError extends Error {
  statusCode: number;

  constructor(
    message = "Unable to validate the Safe transaction right now. Please retry.",
    statusCode = 503
  ) {
    super(message);
    this.name = "SafeTrackedTransactionLookupError";
    this.statusCode = statusCode;
  }
}

function normalizeAddress(address: string) {
  return address.toLowerCase() as `0x${string}`;
}

function getRefreshCacheKey(row: SafeTrackedTransactionRow) {
  return `${row.chain_id}:${row.safe_tx_hash.toLowerCase()}`;
}

function toSummary(
  row: SafeTrackedTransactionRow
): SafeTrackedTransactionSummary {
  return {
    kind: row.kind,
    safeAddress: row.safe_address as `0x${string}`,
    chainId: row.chain_id,
    safeTxHash: row.safe_tx_hash as `0x${string}`,
    createdAt: row.created_at.toISOString(),
  };
}

async function deleteTrackedTransaction(params: {
  chainId: number;
  safeTxHash: `0x${string}` | string;
}) {
  await prismaWeb2Client.$executeRaw(
    Prisma.sql`
      DELETE FROM agora.safe_tracked_transactions
      WHERE chain_id = ${params.chainId}
        AND safe_tx_hash = ${params.safeTxHash}
    `
  );
}

async function refreshRow(
  row: SafeTrackedTransactionRow
): Promise<SafeTrackedTransactionRow | null> {
  const cacheKey = getRefreshCacheKey(row);
  const cached = safeTrackedTransactionRefreshCache.get(cacheKey);
  if (cached && Date.now() - cached.checkedAt < SAFE_TRACKED_TRANSACTION_REFRESH_TTL_MS) {
    return cached.row;
  }

  const lookup = await getSafeMultisigTransactionForClient(
    row.chain_id,
    row.safe_tx_hash as `0x${string}`,
    {
      safeAddress: row.safe_address as `0x${string}`,
      createdAt: row.created_at.getTime(),
    }
  );

  if (
    lookup.found &&
    lookup.status?.safeAddress &&
    normalizeAddress(lookup.status.safeAddress) !== normalizeAddress(row.safe_address)
  ) {
    console.warn("[safe-tracked-transaction] Safe address mismatch on refresh", {
      storedSafeAddress: row.safe_address,
      resolvedSafeAddress: lookup.status.safeAddress,
      safeTxHash: row.safe_tx_hash,
    });
    safeTrackedTransactionRefreshCache.set(cacheKey, {
      checkedAt: Date.now(),
      row,
    });
    return row;
  }

  if (lookup.isSuccessful === null && lookup.missingReason !== "removed") {
    safeTrackedTransactionRefreshCache.set(cacheKey, {
      checkedAt: Date.now(),
      row,
    });
    return row;
  }

  await deleteTrackedTransaction({
    chainId: row.chain_id,
    safeTxHash: row.safe_tx_hash,
  });
  safeTrackedTransactionRefreshCache.delete(cacheKey);
  return null;
}

export async function upsertSafeTrackedTransaction(params: {
  daoSlug: string;
  traceContext?: MiradorTraceContext;
} & CreateSafeTrackedTransactionRequest): Promise<SafeTrackedTransactionSummary> {
  const safeAddress = normalizeAddress(params.safeAddress);
  let lookup;
  try {
    lookup = await getSafeMultisigTransactionForClient(
      params.chainId,
      params.safeTxHash,
      {
        safeAddress,
        createdAt: Date.now(),
      }
    );
  } catch (error) {
    console.warn("[safe-tracked-transaction] initial Safe lookup failed", {
      safeTxHash: params.safeTxHash,
      chainId: params.chainId,
      error,
    });
    throw new SafeTrackedTransactionLookupError();
  }

  if (
    lookup?.found &&
    lookup.status?.safeAddress &&
    normalizeAddress(lookup.status.safeAddress) !== safeAddress
  ) {
    throw new Error("Safe transaction does not belong to the connected Safe");
  }

  const miradorChain = getMiradorChainNameFromChainId(params.chainId);
  if (params.traceContext?.traceId && miradorChain) {
    await appendServerTraceEvent({
      traceContext: {
        ...params.traceContext,
        step: "safe_tracked_transaction_tracking",
        source: "api",
      },
      eventName: "safe_tracked_transaction_recorded",
      details: {
        kind: params.kind,
        safeTxHash: params.safeTxHash,
      },
      safeTxHints: [
        {
          safeTxHash: params.safeTxHash,
          chain: miradorChain,
        },
      ],
    });
  }

  if (lookup?.isSuccessful !== null) {
    return {
      kind: params.kind,
      safeAddress,
      chainId: params.chainId,
      safeTxHash: params.safeTxHash,
      createdAt: new Date().toISOString(),
    };
  }

  const [insertedTransaction] = await prismaWeb2Client.$queryRaw<
    SafeTrackedTransactionRow[]
  >(
    Prisma.sql`
      INSERT INTO agora.safe_tracked_transactions (
        dao_slug,
        kind,
        safe_address,
        chain_id,
        safe_tx_hash
      )
      VALUES (
        ${params.daoSlug},
        ${params.kind},
        ${safeAddress},
        ${params.chainId},
        ${params.safeTxHash}
      )
      ON CONFLICT (safe_tx_hash) DO NOTHING
      RETURNING
        dao_slug,
        kind,
        safe_address,
        chain_id,
        safe_tx_hash,
        created_at
    `
  );

  const transaction =
    insertedTransaction ??
    (
      await prismaWeb2Client.$queryRaw<SafeTrackedTransactionRow[]>(
        Prisma.sql`
          SELECT
            dao_slug,
            kind,
            safe_address,
            chain_id,
            safe_tx_hash,
            created_at
          FROM agora.safe_tracked_transactions
          WHERE safe_tx_hash = ${params.safeTxHash}
          LIMIT 1
        `
      )
    )[0];

  if (!transaction) {
    throw new Error("Failed to persist Safe tracked transaction");
  }

  return toSummary(transaction);
}

export async function discoverSafeTrackedTransaction(params: {
  daoSlug: string;
  traceContext?: MiradorTraceContext;
} & DiscoverSafeTrackedTransactionRequest): Promise<SafeTrackedTransactionSummary | null> {
  let discoveredTransaction;
  try {
    discoveredTransaction = await findQueuedSafeMultisigTransactionForClient({
      chainId: params.chainId,
      safeAddress: params.safeAddress,
      to: params.to,
      data: params.data,
      createdAfter: params.createdAfter,
    });
  } catch (error) {
    console.warn("[safe-tracked-transaction] queued Safe discovery failed", {
      safeAddress: params.safeAddress,
      chainId: params.chainId,
      to: params.to,
      createdAfter: params.createdAfter,
      error,
    });
    throw new SafeTrackedTransactionLookupError();
  }

  if (!discoveredTransaction) {
    return null;
  }

  return upsertSafeTrackedTransaction({
    daoSlug: params.daoSlug,
    traceContext: params.traceContext,
    kind: params.kind,
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    safeTxHash: discoveredTransaction.safeTxHash,
  });
}

export async function listActiveSafeTrackedTransactions(params: {
  daoSlug: string;
  kind: SafeTrackedTransactionSummary["kind"];
  safeAddress: `0x${string}` | string;
}): Promise<SafeTrackedTransactionSummary[]> {
  const rows = await prismaWeb2Client.$queryRaw<SafeTrackedTransactionRow[]>(
    Prisma.sql`
      SELECT
        dao_slug,
        kind,
        safe_address,
        chain_id,
        safe_tx_hash,
        created_at
      FROM agora.safe_tracked_transactions
      WHERE dao_slug = ${params.daoSlug}
        AND kind = ${params.kind}
        AND safe_address = ${normalizeAddress(params.safeAddress)}
      ORDER BY created_at DESC
    `
  );

  const refreshedRows = await Promise.all(
    rows.map(async (row: SafeTrackedTransactionRow) => {
      try {
        return await refreshRow(row);
      } catch (error) {
        console.warn("[safe-tracked-transaction] refresh failed", {
          safeTxHash: row.safe_tx_hash,
          chainId: row.chain_id,
          error,
        });
        return row;
      }
    })
  );

  return refreshedRows
    .filter((row): row is SafeTrackedTransactionRow => row !== null)
    .map((row: SafeTrackedTransactionRow) => toSummary(row));
}

export async function deleteExpiredSafeTrackedTransactions(
  maxAgeMs = SAFE_TRACKED_TRANSACTION_MAX_AGE_MS
) {
  const cutoff = new Date(Date.now() - maxAgeMs);
  const deletedCount = await prismaWeb2Client.$executeRaw(
    Prisma.sql`
      DELETE FROM agora.safe_tracked_transactions
      WHERE created_at < ${cutoff}
    `
  );

  safeTrackedTransactionRefreshCache.clear();

  return {
    deletedCount,
    cutoff,
  };
}
