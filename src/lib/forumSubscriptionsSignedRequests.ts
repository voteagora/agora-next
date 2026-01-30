import { hashStableJson } from "@/lib/crypto/stableJson";

export const FORUM_SUBSCRIPTIONS_ACTIONS = [
  "read_subscriptions",
  "subscribe",
  "unsubscribe",
] as const;

export type ForumSubscriptionsAction =
  (typeof FORUM_SUBSCRIPTIONS_ACTIONS)[number];

export const FORUM_SUBSCRIPTIONS_TYPED_DATA_DOMAIN = {
  name: "Agora Forum Subscriptions",
  version: "1",
} as const;

export const FORUM_SUBSCRIPTIONS_TYPED_DATA_TYPES = {
  ForumSubscriptionsRequest: [
    { name: "action", type: "string" },
    { name: "address", type: "address" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "string" },
    { name: "payload_hash", type: "bytes32" },
  ],
} as const;

export const FORUM_SUBSCRIPTIONS_PRIMARY_TYPE =
  "ForumSubscriptionsRequest" as const;

export function hashForumSubscriptionsPayload(payload: unknown): `0x${string}` {
  return hashStableJson(payload);
}
