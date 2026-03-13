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

function getActiveNonceKey(nonce: string) {
  return `${ACTIVE_SIWE_NONCE_PREFIX}:${nonce}`;
}

function getConsumedNonceKey(nonce: string) {
  return `${CONSUMED_SIWE_NONCE_PREFIX}:${nonce}`;
}

export async function storeSiweNonce(nonce: string, host: string) {
  const payload: StoredSiweNonce = {
    host: host.toLowerCase(),
    issuedAt: new Date().toISOString(),
  };
  const key = getActiveNonceKey(nonce);

  await redis.set(key, payload);
  await redis.expire(key, SIWE_NONCE_TTL_SECONDS);

  return payload;
}

export async function consumeSiweNonce(
  nonce: string
): Promise<ConsumedSiweNonceResult> {
  const consumedKey = getConsumedNonceKey(nonce);
  const didSetConsumed = await redis.setnx(consumedKey, "1");

  if (!didSetConsumed) {
    return {
      ok: false,
      reason: "replayed",
    };
  }

  await redis.expire(consumedKey, SIWE_NONCE_TTL_SECONDS);

  const activeKey = getActiveNonceKey(nonce);
  const payload = await redis.get<StoredSiweNonce>(activeKey);
  await redis.del(activeKey);

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
