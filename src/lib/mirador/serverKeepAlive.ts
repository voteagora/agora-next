import "server-only";

import { getMiradorServerClient } from "./serverClient";

const KEEP_ALIVE_INTERVAL_MS = 10_000;
const MAX_KEEP_ALIVE_DURATION_MS = 5 * 60 * 1000;
const MAX_ACTIVE_TRACE_LEASES = 200;

type TraceLease = {
  startedAt: number;
  lastRefreshedAt: number;
  nextKeepAliveAt: number;
};

const activeLeases = new Map<string, TraceLease>();
let leaseSweepTimer: ReturnType<typeof setInterval> | null = null;
let isLeaseSweepInFlight = false;

async function sendKeepAlive(traceId: string): Promise<boolean> {
  const client = getMiradorServerClient();
  if (!client) {
    return false;
  }

  try {
    const response = await client._keepAlive({ traceId });
    return response.accepted;
  } catch (error) {
    console.error("[mirador-keep-alive] ping failed", { traceId, error });
    return false;
  }
}

function stopLease(traceId: string) {
  if (activeLeases.delete(traceId) && activeLeases.size === 0 && leaseSweepTimer) {
    clearInterval(leaseSweepTimer);
    leaseSweepTimer = null;
  }
}

async function sweepTraceKeepAlives() {
  if (isLeaseSweepInFlight) {
    return;
  }

  isLeaseSweepInFlight = true;
  try {
    const now = Date.now();
    const dueTraceIds: string[] = [];

    for (const [traceId, lease] of activeLeases.entries()) {
      if (now - lease.startedAt > MAX_KEEP_ALIVE_DURATION_MS) {
        activeLeases.delete(traceId);
        continue;
      }

      if (lease.nextKeepAliveAt <= now) {
        lease.nextKeepAliveAt = now + KEEP_ALIVE_INTERVAL_MS;
        dueTraceIds.push(traceId);
      }
    }

    const results = await Promise.all(
      dueTraceIds.map(async (traceId) => ({
        traceId,
        accepted: await sendKeepAlive(traceId),
      }))
    );

    for (const result of results) {
      if (!result.accepted) {
        activeLeases.delete(result.traceId);
      }
    }

    if (activeLeases.size === 0 && leaseSweepTimer) {
      clearInterval(leaseSweepTimer);
      leaseSweepTimer = null;
    }
  } finally {
    isLeaseSweepInFlight = false;
  }
}

function ensureLeaseSweepTimer() {
  if (leaseSweepTimer) {
    return;
  }

  leaseSweepTimer = setInterval(() => {
    void sweepTraceKeepAlives();
  }, KEEP_ALIVE_INTERVAL_MS);
}

export function refreshTraceKeepAlive(traceId: string) {
  if (!traceId) {
    return;
  }

  const now = Date.now();
  const existing = activeLeases.get(traceId);
  if (existing) {
    existing.lastRefreshedAt = now;
    return;
  }

  if (activeLeases.size >= MAX_ACTIVE_TRACE_LEASES) {
    console.warn("[mirador-keep-alive] trace lease cap reached", {
      traceId,
      activeLeaseCount: activeLeases.size,
      maxActiveLeaseCount: MAX_ACTIVE_TRACE_LEASES,
    });
    return;
  }

  activeLeases.set(traceId, {
    startedAt: now,
    lastRefreshedAt: now,
    nextKeepAliveAt: now + KEEP_ALIVE_INTERVAL_MS,
  });
  ensureLeaseSweepTimer();
}

export function stopTraceKeepAlive(traceId: string) {
  stopLease(traceId);
}

export async function closeTraceFromServer(
  traceId: string,
  reason?: string
): Promise<boolean> {
  stopLease(traceId);

  const client = getMiradorServerClient();
  if (!client) {
    console.warn("[mirador-close] server client not available", { traceId });
    return false;
  }

  try {
    const trace = client.trace({
      traceId,
      autoKeepAlive: false,
    });
    await trace.close(reason);
    const closed = trace.isClosed();
    console.info("[mirador-close] server trace.close() completed", {
      traceId,
      reason,
      closed,
    });
    return closed;
  } catch (error) {
    console.error("[mirador-close] server trace.close() failed", {
      traceId,
      reason,
      error,
    });
    return false;
  }
}
