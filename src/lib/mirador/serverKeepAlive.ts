import "server-only";

import { getMiradorServerClient } from "./serverClient";

const KEEP_ALIVE_INTERVAL_MS = 10_000;
const MAX_KEEP_ALIVE_DURATION_MS = 5 * 60 * 1000;

type TraceLease = {
  timer: ReturnType<typeof setInterval>;
  startedAt: number;
  lastRefreshedAt: number;
};

const activeLeases = new Map<string, TraceLease>();

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
  const lease = activeLeases.get(traceId);
  if (lease) {
    clearInterval(lease.timer);
    activeLeases.delete(traceId);
  }
}

export function refreshTraceKeepAlive(traceId: string) {
  if (!traceId) {
    return;
  }

  const existing = activeLeases.get(traceId);
  if (existing) {
    existing.lastRefreshedAt = Date.now();
    return;
  }

  const now = Date.now();
  const timer = setInterval(async () => {
    const lease = activeLeases.get(traceId);
    if (!lease || Date.now() - lease.startedAt > MAX_KEEP_ALIVE_DURATION_MS) {
      stopLease(traceId);
      return;
    }

    const accepted = await sendKeepAlive(traceId);
    if (!accepted) {
      stopLease(traceId);
    }
  }, KEEP_ALIVE_INTERVAL_MS);

  activeLeases.set(traceId, {
    timer,
    startedAt: now,
    lastRefreshedAt: now,
  });
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
