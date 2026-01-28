import "server-only";

import { buildForumTopicPath } from "@/lib/forumUtils";
import { hashStableJson } from "@/lib/crypto/stableJson";
import {
  notificationCenterClient,
  type BroadcastEventPayload,
  type CompoundEventPayload,
  type SendEventPayload,
} from "./client";
import type { ChannelType, RecipientType } from "./types";
import { processAddressOrEnsName } from "@/app/lib/ENSUtils";

const ALL_CHANNELS: ChannelType[] = ["email", "telegram", "discord", "slack"];

/**
 * Format an address for display in notifications.
 * Returns ENS name if available, otherwise truncated address (0x1234...abcd).
 */
export async function formatAddressForNotification(
  address: string
): Promise<string> {
  try {
    const formatted = await processAddressOrEnsName(address);
    return formatted || address;
  } catch (error) {
    // Fallback to raw address if ENS lookup fails
    return address;
  }
}

/**
 * Build a profile URL for a given address.
 */
export function buildProfileUrl(address: string): string {
  const baseUrl = getSiteBaseUrl();
  return baseUrl ? `${baseUrl}/delegates/${address}` : `/delegates/${address}`;
}

const CHANNEL_SET = new Set<ChannelType>(ALL_CHANNELS);
const ALLOWED_CHANNELS_CACHE_TTL_MS = 5 * 60 * 1000;

type AllowedChannelsCache = {
  channels: ChannelType[];
  expiresAtMs: number;
};

let allowedChannelsCache: AllowedChannelsCache | null = null;
let allowedChannelsInflight: Promise<ChannelType[]> | null = null;

function parseChannelsList(value: string): ChannelType[] {
  const channels = value
    .split(/[,\s]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry): entry is ChannelType =>
      CHANNEL_SET.has(entry as ChannelType)
    );

  return [...new Set(channels)];
}

async function resolveEmissionChannels(): Promise<ChannelType[]> {
  const envChannels = process.env.NOTIFICATION_CENTER_CHANNELS;
  if (envChannels) {
    const parsed = parseChannelsList(envChannels);
    if (parsed.length) return parsed;
  }

  const now = Date.now();
  if (allowedChannelsCache && now < allowedChannelsCache.expiresAtMs) {
    return allowedChannelsCache.channels;
  }

  if (allowedChannelsInflight) {
    return allowedChannelsInflight;
  }

  allowedChannelsInflight = (async () => {
    try {
      const me = await notificationCenterClient.getMe();
      const allowed = (me?.allowed_channels ?? []).filter((channel) =>
        CHANNEL_SET.has(channel)
      );

      const resolved = allowed.length ? allowed : ALL_CHANNELS;
      allowedChannelsCache = {
        channels: resolved,
        expiresAtMs: Date.now() + ALLOWED_CHANNELS_CACHE_TTL_MS,
      };
      return resolved;
    } catch (error) {
      console.warn(
        "Failed to resolve Notification Center allowed channels",
        error
      );
      allowedChannelsCache = {
        channels: ALL_CHANNELS,
        expiresAtMs: Date.now() + 30_000,
      };
      return ALL_CHANNELS;
    } finally {
      allowedChannelsInflight = null;
    }
  })();

  return allowedChannelsInflight;
}

function normalizeRecipientId(recipientId: string): string {
  return recipientId.toLowerCase();
}

function getSiteBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL;
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const apiBase = process.env.NEXT_PUBLIC_AGORA_BASE_URL;
  if (apiBase) {
    try {
      const url = new URL(apiBase);
      url.pathname = url.pathname.replace(/\/api\/v1\/?$/, "");
      return url.toString().replace(/\/+$/, "");
    } catch (error) {
      console.warn("Failed to parse NEXT_PUBLIC_AGORA_BASE_URL", error);
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "";
}

export function buildForumTopicUrl(
  topicId: number,
  title?: string | null
): string {
  const path = buildForumTopicPath(topicId, title);
  const baseUrl = getSiteBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function buildForumPostUrl(
  topicId: number,
  title?: string | null,
  postId?: number | null
): string {
  const topicUrl = buildForumTopicUrl(topicId, title);
  return postId ? `${topicUrl}#post-${postId}` : topicUrl;
}

export type AudienceFilter = {
  attributes?: Record<string, unknown>;
  recipient_ids?: string[];
  recipient_type?: RecipientType;
  exclude_recipient_ids?: string[];
};

export function emitDirectEvent(
  eventType: string,
  recipientId: string,
  entityId: string,
  data: Record<string, unknown>
) {
  void (async () => {
    const channels = await resolveEmissionChannels();
    const normalizedRecipientId = normalizeRecipientId(recipientId);

    const idempotencyKey = `agora-${hashStableJson({
      kind: "direct",
      event_type: eventType,
      entity_id: entityId,
      recipient_id: normalizedRecipientId,
    }).slice(2)}`;

    const payload: SendEventPayload = {
      event_type: eventType,
      entity_id: entityId,
      recipients: [
        {
          recipient_id: normalizedRecipientId,
          channels,
        },
      ],
      data,
    };

    await notificationCenterClient.sendEvent(payload, { idempotencyKey });
  })().catch((error) => console.error("Failed to emit direct event", error));
}

export function emitBroadcastEvent(
  eventType: string,
  entityId: string,
  filter: AudienceFilter,
  data: Record<string, unknown>
) {
  void (async () => {
    const channels = await resolveEmissionChannels();
    const idempotencyKey = `agora-${hashStableJson({
      kind: "broadcast",
      event_type: eventType,
      entity_id: entityId,
      filter,
    }).slice(2)}`;

    const payload: BroadcastEventPayload = {
      event_type: eventType,
      entity_id: entityId,
      filter,
      channels,
      data,
    };

    await notificationCenterClient.sendBroadcastEvent(payload, {
      idempotencyKey,
    });
  })().catch((error) => console.error("Failed to emit broadcast event", error));
}

export type CompoundCandidateInput =
  | {
      kind: "direct";
      eventType: string;
      entityId: string;
      recipientIds: string[];
      data: Record<string, unknown>;
      templateId?: string;
      priority?: "high" | "normal" | "low";
    }
  | {
      kind: "broadcast";
      eventType: string;
      entityId: string;
      filter?: AudienceFilter;
      data: Record<string, unknown>;
      templateId?: string;
      priority?: "high" | "normal" | "low";
    };

export function emitCompoundEvent(
  dedupeGroup: string,
  dedupeKey: string,
  candidates: CompoundCandidateInput[]
) {
  if (!candidates.length) {
    return;
  }

  void (async () => {
    const channels = await resolveEmissionChannels();

    const payload: CompoundEventPayload = {
      dedupe_group: dedupeGroup,
      dedupe_key: dedupeKey,
      candidates: candidates.map((candidate) => {
        if (candidate.kind === "direct") {
          return {
            kind: "direct",
            event_type: candidate.eventType,
            entity_id: candidate.entityId,
            recipients: candidate.recipientIds.map((recipientId) => ({
              recipient_id: normalizeRecipientId(recipientId),
              channels,
            })),
            data: candidate.data,
            ...(candidate.templateId !== undefined
              ? { template_id: candidate.templateId }
              : {}),
            ...(candidate.priority !== undefined
              ? { priority: candidate.priority }
              : {}),
          };
        }

        return {
          kind: "broadcast",
          event_type: candidate.eventType,
          entity_id: candidate.entityId,
          ...(candidate.filter !== undefined
            ? { filter: candidate.filter }
            : {}),
          channels,
          data: candidate.data,
          ...(candidate.templateId !== undefined
            ? { template_id: candidate.templateId }
            : {}),
          ...(candidate.priority !== undefined
            ? { priority: candidate.priority }
            : {}),
        };
      }),
    };

    const idempotencyKey = `agora-${hashStableJson({
      kind: "compound",
      dedupe_group: payload.dedupe_group,
      dedupe_key: payload.dedupe_key,
    }).slice(2)}`;

    await notificationCenterClient.sendCompoundEvent(payload, {
      idempotencyKey,
    });
  })().catch((error) => console.error("Failed to emit compound event", error));
}

type AttributeKey =
  | "subscribed_categories"
  | "subscribed_topics"
  | "engaged_topics"
  | "authored_topics";

type AttributeValue = number | string;

async function ensureRecipientExists(recipientId: string): Promise<void> {
  const normalizedId = normalizeRecipientId(recipientId);

  // Try to create first - if it already exists, the API should return success or a specific error
  // This avoids the race condition where we check, then another request creates, then we fail
  try {
    await notificationCenterClient.createRecipient({
      recipient_id: normalizedId,
      recipient_type: "wallet_address",
    });
  } catch (error) {
    // Ignore "already exists" errors (typically 409 Conflict)
    // The recipient exists, which is what we want
    const isConflict =
      error instanceof Error &&
      (error.message.includes("409") ||
        error.message.includes("already exists") ||
        error.message.includes("conflict"));
    if (!isConflict) {
      throw error;
    }
  }
}

function normalizeAttributeValue(value: AttributeValue): AttributeValue {
  if (typeof value === "string") {
    return value.toLowerCase();
  }
  return value;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("404");
}

async function updateRecipientAttributeListAtomicOrThrow(
  recipientId: string,
  key: AttributeKey,
  value: AttributeValue,
  action: "add" | "remove"
) {
  const normalizedValue = normalizeAttributeValue(value);
  const normalizedId = normalizeRecipientId(recipientId);

  if (action === "add") {
    await ensureRecipientExists(normalizedId);
    await notificationCenterClient.addRecipientAttributeArrayValues(
      normalizedId,
      key,
      [normalizedValue]
    );
    return;
  }

  try {
    await notificationCenterClient.removeRecipientAttributeArrayValues(
      normalizedId,
      key,
      [normalizedValue]
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

export async function addRecipientAttributeValueAtomic(
  recipientId: string,
  key: AttributeKey,
  value: AttributeValue
) {
  await updateRecipientAttributeListAtomicOrThrow(
    recipientId,
    key,
    value,
    "add"
  );
}

export async function removeRecipientAttributeValueAtomic(
  recipientId: string,
  key: AttributeKey,
  value: AttributeValue
) {
  await updateRecipientAttributeListAtomicOrThrow(
    recipientId,
    key,
    value,
    "remove"
  );
}

export function addRecipientAttributeValue(
  recipientId: string,
  key: AttributeKey,
  value: AttributeValue
) {
  void addRecipientAttributeValueAtomic(recipientId, key, value).catch(
    (error) => console.error("Failed to update recipient attributes", error)
  );
}

export function removeRecipientAttributeValue(
  recipientId: string,
  key: AttributeKey,
  value: AttributeValue
) {
  void removeRecipientAttributeValueAtomic(recipientId, key, value).catch(
    (error) => console.error("Failed to update recipient attributes", error)
  );
}
