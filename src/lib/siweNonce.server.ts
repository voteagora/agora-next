import "server-only";

import redis from "@/lib/redis";
import { SIWE_NONCE_TTL_SECONDS } from "@/lib/constants";

const ACTIVE_SIWE_NONCE_PREFIX = "siwe:nonce:active";
const CONSUMED_SIWE_NONCE_PREFIX = "siwe:nonce:consumed";

type StoredSiweNonce = {
  host: string;
  issuedAt: string;
};

type ConsumedSiweNonceResult =
  | {
      ok: true;
      nonce: StoredSiweNonce;
    }
  | {
      ok: false;
      reason: "replayed" | "missing";
    };

const localNonceStore = new Map<
  string,
  { payload: StoredSiweNonce; expiresAt: number; consumed: boolean }
>();

function getActiveNonceKey(nonce: string) {
  return `${ACTIVE_SIWE_NONCE_PREFIX}:${nonce}`;
}

function getConsumedNonceKey(nonce: string) {
  return `${CONSUMED_SIWE_NONCE_PREFIX}:${nonce}`;
}

function shouldUseLocalNonceStore() {
  return process.env.VIBDAO_LOCAL_MODE === "true";
}

function purgeExpiredLocalNonces() {
  const now = Date.now();
  for (const [key, value] of localNonceStore.entries()) {
    if (value.expiresAt <= now) {
      localNonceStore.delete(key);
    }
  }
}

export async function storeSiweNonce(nonce: string, host: string) {
  const payload: StoredSiweNonce = {
    host: host.toLowerCase(),
    issuedAt: new Date().toISOString(),
  };

  if (shouldUseLocalNonceStore()) {
    purgeExpiredLocalNonces();
    localNonceStore.set(nonce, {
      payload,
      expiresAt: Date.now() + SIWE_NONCE_TTL_SECONDS * 1000,
      consumed: false,
    });
    return payload;
  }

  const key = getActiveNonceKey(nonce);

  await redis.set(key, payload, { ex: SIWE_NONCE_TTL_SECONDS });

  return payload;
}

export async function consumeSiweNonce(
  nonce: string
): Promise<ConsumedSiweNonceResult> {
  if (shouldUseLocalNonceStore()) {
    purgeExpiredLocalNonces();
    const entry = localNonceStore.get(nonce);

    if (!entry) {
      return {
        ok: false,
        reason: "missing",
      };
    }

    if (entry.consumed) {
      return {
        ok: false,
        reason: "replayed",
      };
    }

    entry.consumed = true;
    localNonceStore.delete(nonce);

    return {
      ok: true,
      nonce: {
        host: entry.payload.host.toLowerCase(),
        issuedAt: entry.payload.issuedAt,
      },
    };
  }

  const consumedKey = getConsumedNonceKey(nonce);
  const didSetConsumed = await redis.set(consumedKey, "1", {
    nx: true,
    ex: SIWE_NONCE_TTL_SECONDS,
  });

  if (didSetConsumed !== "OK") {
    return {
      ok: false,
      reason: "replayed",
    };
  }

  const activeKey = getActiveNonceKey(nonce);
  const payload = await redis.getdel<StoredSiweNonce>(activeKey);

  if (!payload?.host || !payload?.issuedAt) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  return {
    ok: true,
    nonce: {
      host: payload.host.toLowerCase(),
      issuedAt: payload.issuedAt,
    },
  };
}
